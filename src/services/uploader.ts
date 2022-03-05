import {singleton} from '../utils/di'
import debug from 'debug'
import {promises} from 'fs'
import crypto from 'crypto'
import net from 'net'
import dgram from 'dgram'
import {
  BehaviorSubject,
  bindCallback,
  bindNodeCallback,
  catchError,
  concatMap,
  defer,
  delayWhen,
  forkJoin,
  from,
  fromEvent,
  map,
  Observable,
  of,
  pairwise,
  race,
  retryWhen,
  switchMap,
  take,
  tap,
  timer,
  toArray,
} from 'rxjs'

import {CHUNK_SIZE, U_AUTH, U_FLASH} from '../constants'

import {UploaderCommandEnum} from '../types/commands'

import {ServiceFactory} from '../factories/service'

import {md5} from '../utils/security'

import {uploadArgumentsValidator} from '../validators/upload'

import {addToCache, createCache} from '../utils/rxjs/cache'

import {
  InvitationTimeout,
  PasswordRequired,
  InvitationIncompatibleResponse,
  AuthenticationTimeout,
  AuthenticationFailed,
  AuthenticationUnknownResponse,
  InvitationUnknownResponse,
  ConnectionTimeout,
  UploadTimeout,
  UploadUnknownError,
} from '../errors/upload'

const debugLog = debug('service:uploader')
const debugTcpLog = debugLog.extend('tcp')
const debugSocketLog = debugLog.extend('socket')

/**
 * Uploader service
 */
@singleton()
export class UploaderService extends ServiceFactory {
  private _udpSocket: dgram.Socket;

  public constructor() {
    super({workerName: 'uploader'})

    this._udpSocket = dgram.createSocket('udp4')
  }

  public parseUploadArguments(
    binaryFilePath: string,
    deviceIp: string,
    devicePort: number,
    password?: string,
  ): {
    binaryFilePath: string;
    deviceIp: string;
    devicePort: number;
    password?: string;
  } {
    return uploadArgumentsValidator.parse({
      binaryFilePath,
      deviceIp,
      devicePort,
      password,
    })
  }

  public upload(
    binaryFilePath: string,
    deviceIp: string,
    devicePort: number,
    password?: string,
  ) {
    const hashedPassword = password ? md5(password) : undefined

    return createCache({
      binaryFilePath,
      deviceIp,
      devicePort,
      password,
      hashedPassword,
    }).pipe(
      // Get file info
      addToCache(this._getFileInfo, file => file),
      // Start TCP server
      addToCache(this._initServer, server => ({server})),
      // Send invitation
      switchMap(cache => this._sendInvitation(cache).pipe(map(() => cache))),
      // Wait for connection
      addToCache(this._waitDeviceConnection, socket => ({socket})),
      // Transmit file
      switchMap(cache => {
        this._udpSocket.unref()

        const progressSubject = new BehaviorSubject(0)

        const progressSubjectLogger = progressSubject
        .pipe(pairwise())
        .subscribe(([oldProgress, progress]) => {
          if (progress === oldProgress) return

          debugSocketLog(
            `uploading... ${Math.ceil((progress / cache.fileSize) * 100)}`,
          )
        })

        cache.socket.setTimeout(10_000)

        cache.socket.on('error', error => {
          debugSocketLog(`error : ${error}`)
        })

        const cleanUp$ = of({}).pipe(
          tap(() => {
            debugLog('cleaning up...')
          }),
          map(() => {
            progressSubjectLogger.unsubscribe()
            cache.socket.removeAllListeners()
          }),
          switchMap(() =>
            from(
              bindCallback(this._udpSocket.close.bind(this._udpSocket))(),
            ).pipe(tap(() => console.log('[udp] closed'))),
          ),
          switchMap(() =>
            from(this._socketEndAsObservable(cache.socket)()).pipe(
              tap(() => console.log('[socket] closed')),
            ),
          ),
        )

        return race([
          // Timeout
          timer(20_000).pipe(
            tap(() => {
              throw new UploadTimeout()
            }),
          ),

          fromEvent(cache.socket, 'error').pipe(
            map(error => {
              throw error
            }),
          ),

          of(cache.file).pipe(
            // Split file in chunks
            switchMap(file => {
              const parts = []

              while (parts.length * CHUNK_SIZE < file.length) {
                const p: number = parts.length * CHUNK_SIZE
                parts.push(file.slice(p, p + CHUNK_SIZE))
              }

              return from(parts)
            }),
            // Send chunks
            concatMap(part =>
              from(
                bindNodeCallback(cache.socket.write.bind(cache.socket))(part),
              ).pipe(
                // Wait device acknowledgement
                switchMap(() =>
                  // Listen for "data" event
                  fromEvent<net.Socket>(cache.socket, 'data').pipe(
                    take(1),
                    map(data => {
                      const stringData = data.toString().split(',')[0]

                      // Check acknowledgement
                      if (!Number.isNaN(stringData)) {
                        progressSubject.next(
                          progressSubject.value + part.toString().length,
                        )
                        return of(data)
                      }

                      // TODO : add verification at the end

                      throw new UploadUnknownError()
                    }),
                  ),
                ),
              ),
            ),
            toArray(),
            tap(() => {
              debugSocketLog('upload complete')
            }),
          ),
        ]).pipe(
          catchError(error => {
            debugSocketLog('error, aborting...')

            return cleanUp$.pipe(
              map(() => {
                throw error
              }),
            )
          }),
          switchMap(() => cleanUp$),
          tap(() => {
            debugLog('done')
          }),
        )
      }),
    )

    /* return this.createWorker({
      cmd: UploaderCommandEnum.Enum.upload,
      data: {
        binaryFilePath,
        deviceIp,
        devicePort,
        password,
      },
    }) */
  }

  /* Retrieve file and his size and hash */
  private _getFileInfo<T extends { binaryFilePath: string }>(
    cache: T,
  ): Observable<{ file: Buffer; fileHash: string; fileSize: number }> {
    return defer(() => {
      const hash = crypto.createHash('md5')
      const buffer = Buffer.alloc(CHUNK_SIZE)

      return of({hash, buffer})
    }).pipe(
      switchMap(nestedCache =>
        forkJoin([
          // Get file size
          from(promises.stat(cache.binaryFilePath)).pipe(
            map(stat => stat.size),
          ),
          // Get file and calculate hash
          from(promises.readFile(cache.binaryFilePath)).pipe(
            // Calculate hash (reducing memory fingerprint by splitting file in chunks)
            switchMap(file => {
              for (let i = 0; i < file.length; i += CHUNK_SIZE) {
                nestedCache.hash.update(file.slice(i, i + CHUNK_SIZE))
              }

              // Return hash overwrite
              return of({hash: nestedCache.hash.digest('hex'), file})
            }),
          ),
        ]).pipe(
          map(([fileSize, {hash, file}]) => ({
            file,
            fileHash: hash,
            fileSize,
          })),
        ),
      ),
    )
  }

  private _initServer(): Observable<net.Server> {
    return defer(() => {
      debugTcpLog('starting...')
      return of(net.createServer({allowHalfOpen: true}))
    }).pipe(
      switchMap(
        server =>
          new Observable<net.Server>(observer => {
            server
            .listen(0, () => {
              observer.next(server)
              observer.complete()
            })
            .unref()

            server.once('error', observer.error)
          }),
      ),
      tap(() => debugTcpLog('ready')),
    )
  }

  private _sendInvitation<
    T extends {
      deviceIp: string;
      devicePort: number;
      hashedPassword?: string;
      fileHash: string;
      fileSize: number;
      server: net.Server;
    }
  >(cache: T): Observable<0 | Buffer> {
    return defer(() => {
      const address = cache.server.address()
      if (!address || typeof address !== 'object' || !('port' in address))
        // TODO : replace by named error
        throw new Error('server address is not valid')

      const messageBuffer = Buffer.from(
        `${U_FLASH} ${address.port} ${cache.fileSize} ${cache.fileHash}`,
      )

      return race([
        // Timeout
        timer(2000).pipe(
          tap(() => {
            throw new InvitationTimeout()
          }),
        ),

        // Send invitation
        defer(() => {
          debugTcpLog('invitation sent, waiting for response...')
          return from(
            this._udpSocketSendAsObservable(
              messageBuffer,
              0,
              messageBuffer.length,
              cache.devicePort,
              cache.deviceIp,
            ),
          )
        }).pipe(
          switchMap(() =>
            fromEvent<Buffer>(this._udpSocket, 'message').pipe(
              take(1),
              switchMap(data => {
                debugTcpLog('invitation acknowledged')

                const stringData = data.toString().split(',')[0]

                if (/OK/.test(stringData)) {
                  debugTcpLog(`authentication required : ${false}`)
                  return of(data)
                }

                if (/AUTH/.test(stringData)) {
                  debugTcpLog(`authentication required : ${true}`)

                  if (!cache.hashedPassword) throw new PasswordRequired()

                  const challenge = stringData.match(/AUTH (\S+)/)

                  if (!challenge) throw new InvitationIncompatibleResponse()

                  const nonce = challenge[1]
                  const clientNonce = md5(
                    nonce + cache.deviceIp + String(Date.now()),
                  )
                  const response = `${cache.hashedPassword}:${nonce}:${clientNonce}`
                  const responseHash = md5(response)

                  const messageBuffer = Buffer.from(
                    `${U_AUTH} ${clientNonce} ${responseHash}\n`,
                  )

                  return race([
                    // Timeout
                    timer(2000).pipe(
                      tap(() => {
                        throw new AuthenticationTimeout()
                      }),
                    ),
                    // Send authentication
                    defer(() => {
                      debugLog.extend(
                        'udp',
                        'authentication sent, waiting for response...',
                      )
                      return from(
                        this._udpSocketSendAsObservable(
                          messageBuffer,
                          0,
                          messageBuffer.length,
                          cache.devicePort,
                          cache.deviceIp,
                        ),
                      )
                    }).pipe(
                      switchMap(() =>
                        fromEvent<Buffer>(this._udpSocket, 'message').pipe(
                          take(1),
                          switchMap(data => {
                            debugLog.extend(
                              'udp',
                              'authentication acknowledged',
                            )

                            const stringData = data.toString().split(',')[0]

                            if (/OK/.test(stringData)) {
                              debugTcpLog('authentication success')
                              return of(data)
                            }

                            if (/Authentication Failed/.test(stringData)) {
                              throw new AuthenticationFailed()
                            }

                            throw new AuthenticationUnknownResponse()
                          }),
                        ),
                      ),
                    ),
                  ])
                }

                throw new InvitationUnknownResponse()
              }),
            ),
          ),
        ),
      ]).pipe(
        retryWhen(errors =>
          errors.pipe(
            switchMap(error => {
              if (error instanceof InvitationTimeout) {
                // Restart in 2 seconds
                return of(error).pipe(delayWhen(() => timer(2000)))
              }

              throw error
            }),
          ),
        ),
      )
    })
  }

  private _waitDeviceConnection<
    T extends {
      server: net.Server;
    }
  >(cache: T): Observable<net.Socket> {
    return defer(() => {
      debugSocketLog('waiting for connection...')
      return race([
        // Timeout
        timer(5000).pipe(
          map(() => {
            throw new ConnectionTimeout()
          }),
        ),
        // Listen for "connection" event
        fromEvent<net.Socket>(cache.server, 'connection').pipe(
          tap(() => {
            debugSocketLog('device connected')

            cache.server.close(error => {
              if (error) throw error
            })
          }),
        ),
      ])
    })
  }

  private _udpSocketSendAsObservable = bindNodeCallback(
    (
      msg: string | Uint8Array,
      offset: number,
      length: number,
      port: number,
      address: string,
      callback: (error: Error | null, bytes: number) => void,
      // eslint-disable-next-line max-params
    ) => this._udpSocket.send(msg, offset, length, port, address, callback),
  );

  private _socketEndAsObservable(socket: net.Socket) {
    return bindCallback((callback: () => void) => socket.end(callback))
  }
}
