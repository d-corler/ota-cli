import debug from 'debug'
import {parentPort, workerData} from 'worker_threads'
import {
  BehaviorSubject,
  bindCallback,
  lastValueFrom,
  of,
  tap,
  switchMap,
  race,
  timer,
  map,
  fromEvent,
  filter,
  skipUntil,
} from 'rxjs'
import mdns from 'multicast-dns'
import {z} from 'zod'

import constants from '../constants'

import {WorkerFactory} from '../factories/worker'

import {ScannerCommandEnum} from '../types/commands'

import {scanArgumentsValidator} from '../validators/upload'

import {DeviceEntity} from '../entities/device'

import {addToCache, createCache} from '../utils/rxjs/cache'

import {ScanUnknownError} from '../errors/scan'

import type {Observable} from 'rxjs'
import type {RecordTypeEnum} from '../types/dns'

const debugLog = debug('worker:scanner')

const dataParser = z.object({
  cmd: z.literal(ScannerCommandEnum.Enum.scan),
  data: scanArgumentsValidator,
})

/**
 * Scanner worker
 */
class ScannerWorker extends WorkerFactory<typeof dataParser> {
  public __scan() {
    debugLog('scanning...')

    // Scanned devices will be registered in this store
    const _devicesStore = new BehaviorSubject(new Map<string, DeviceEntity>())

    // Create cache
    return lastValueFrom(
      createCache({...this._data.data}).pipe(
        // Create MDNS client
        addToCache(this._createMdnsClient, mdnsClient => ({mdnsClient})),
        // Run MDNS query
        addToCache(this._runMdnsQuery, mdnsQuery => ({mdnsQuery})),
        // Check if an error occurred
        tap(({mdnsQuery}) => {
          if (mdnsQuery[0]) throw new ScanUnknownError()
        }),
        // Listen for mDNS responses
        switchMap(cache =>
          race([
            // Listening timeout
            timer(constants.DEVICES_SCAN_DURATION).pipe(
              map(() => _devicesStore.value),
            ),

            // Listen for responses
            fromEvent<[mdns.ResponsePacket, mdns.RemoteInfoOutgoing]>(
              cache.mdnsClient,
              'response',
            ).pipe(
              // Filter out responses that are not for the service we are looking for
              filter(([response]) =>
                response.answers.some(
                  answer =>
                    answer.name === cache.dnsServiceName &&
                    answer.type === cache.dnsServiceType,
                ),
              ),
              // Create / update device entry
              map(([response, info]) => {
                const deviceName = response.additionals
                .find(answer => answer.type === 'A')
                ?.name.replace(/\.local/, '')

                const txt = response.additionals.find(
                  answer => answer.type === 'TXT',
                )

                let txtFormatted: Record<string, string> | undefined

                if (txt && 'data' in txt && Array.isArray(txt.data)) {
                  txtFormatted = txt.data
                  .map(buffer => Buffer.from(buffer).toString())
                  // eslint-disable-next-line unicorn/no-array-reduce
                  .reduce((acc, entry) => {
                    const s = entry.split('=')
                    acc[String(s[0])] = s[1]
                    return acc
                  }, {} as Record<string, string>)
                }

                if (deviceName) {
                  _devicesStore.value.set(deviceName, {
                    ip: info.address!,
                    txt: txtFormatted,
                  })
                }

                return _devicesStore.value
              }),
              skipUntil(timer(5000)),
            ),
          ]),
        ),

        // Complete the process
        tap(() => {
          debugLog('scanning finished')
          // Send the devices to the parent thread
          parentPort?.postMessage({
            cmd: ScannerCommandEnum.Enum.scan,
            result: _devicesStore.value,
          })
        }),
      ),
    ).catch(error => {
      debugLog('scanning failed')
      // Send the error to the parent thread
      parentPort?.postMessage({
        cmd: ScannerCommandEnum.Enum.scan,
        error: error.message,
      })
    })
  }

  private _createMdnsClient<
    T extends {
      interfaceIp: string;
    }
  >(cache: T): Observable<mdns.MulticastDNS> {
    debugLog('mdns client created')
    return of(
      mdns({
        interface: cache.interfaceIp,
      }),
    )
  }

  private _runMdnsQuery<
    T extends {
      mdnsClient: mdns.MulticastDNS;
      dnsServiceName: string;
      dnsServiceType: RecordTypeEnum;
    }
  >(cache: T) {
    debugLog('sending mdns query...')
    return bindCallback(cache.mdnsClient.query)(
      cache.dnsServiceName,
      cache.dnsServiceType,
    )
  }
}

if (parentPort) {
  const worker = new ScannerWorker(
    debugLog,
    parentPort,
    workerData,
    dataParser,
  )

  worker.run()
}
