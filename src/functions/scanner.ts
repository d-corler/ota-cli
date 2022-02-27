import {
  from,
  bindCallback,
  tap,
  map,
  switchMap,
  race,
  timer,
  fromEvent,
  filter,
  skipUntil,
  BehaviorSubject,
} from 'rxjs'
import mdns from 'multicast-dns'
import inquirer from 'inquirer'

import {NewScanRequired, ScanUnknownError} from '../errors/scan.errors'

import constants from '../constants'

import {DeviceNotFoundError} from '../errors/device.error'

import type {Observable} from 'rxjs'

export interface IDevice {
  ip: string;
  txt?: Record<string, string>;
}

export type IDevices = Map<string, IDevice>;

type ScanOperatorCache = {
  flags: {
    dnsServiceName: string;
    dnsServiceType: string;
  };
  mdnsClient: mdns.MulticastDNS;
};
type ScanOperatorResult<T> = Observable<T & { devices: IDevices }>;
type SelectOperatorCache = {
  devices: IDevices;
};
type SelectOperatorResult<T> = Observable<T & { selectedDevice: IDevice }>;

type Methods = keyof Scanner;

export class Scanner {
  /**
   * Use "scan" method as operator with cache
   * @param method "scan" method will be used
   * @returns "scan" operator result
   */
  operate<T extends ScanOperatorCache>(
    method: 'scan'
  ): (cache: T) => ScanOperatorResult<T>;

  /**
   * Use "select" method as operator with cache
   * @param method "select" method will be used
   * @returns "select" operator result
   */
  operate<T extends SelectOperatorCache>(
    method: 'select'
  ): (cache: T) => SelectOperatorResult<T>;

  /**
   * Use method as operator with cache
   * @param {Methods} method method to use
   * @returns operator result
   */
  operate<T extends ScanOperatorCache | SelectOperatorCache>(
    method: Methods,
  ): (cache: T) => ScanOperatorResult<T> | SelectOperatorResult<T> {
    switch (method) {
    case 'scan':
      return cache => {
        if (!('mdnsClient' in cache)) throw new Error('Cache is not valid')
        return this.scan(
          cache.mdnsClient,
          cache.flags.dnsServiceName,
          cache.flags.dnsServiceType,
        ).pipe(map(devices => Object.assign({}, cache, {devices})))
      }

    case 'select':
      return cache => {
        if (!('devices' in cache)) throw new Error('Cache is not valid')
        return this.select(cache.devices).pipe(
          map(selectedDevice =>
            Object.assign({}, cache, {selectedDevice}),
          ),
        )
      }

    default:
      throw new Error('Method not found')
    }
  }

  /**
   * Scan devices via mDNS
   * @param {mdns.MulticastDNS} mdnsClient mDNS client
   * @param {string} dnsServiceName mDNS service name
   * @param {string} dnsServiceType mDNS service type
   * @returns scanned devices
   */
  public scan(
    mdnsClient: mdns.MulticastDNS,
    dnsServiceName: string,
    dnsServiceType: string,
  ): Observable<IDevices> {
    // Scanned devices will be registered in this store
    const _devicesStore = new BehaviorSubject(new Map<string, IDevice>())

    return from(
      bindCallback(mdnsClient.query)(
        dnsServiceName,
        // TODO : not safe, improve validation
        dnsServiceType as Parameters<typeof mdnsClient.query>[1],
      ).pipe(
        // Check if an error occurred
        tap(([error]) => {
          if (error) throw new ScanUnknownError()
        }),
        // Read store content
        map(() => _devicesStore.value),
        // Listen for mDNS responses
        switchMap(storeValue =>
          race([
            // Listening timeout
            timer(constants.DEVICES_SCAN_DURATION).pipe(map(() => storeValue)),

            // Listen for responses
            fromEvent<[mdns.ResponsePacket, mdns.RemoteInfoOutgoing]>(
              mdnsClient,
              'response',
            ).pipe(
              // Filter out responses that are not for the service we are looking for
              filter(([response]) =>
                response.answers.some(
                  answer =>
                    answer.name === dnsServiceName &&
                    answer.type === dnsServiceType,
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
                  storeValue.set(deviceName, {
                    ip: info.address!,
                    txt: txtFormatted,
                  })
                }

                return storeValue
              }),
              skipUntil(timer(5000)),
            ),
          ]),
        ),
      ),
    )
  }

  /**
   * Select a device from a list of devices
   * @param {IDevices} devices list of devices
   * @returns selected device
   */
  public select(devices: IDevices): Observable<IDevice> {
    const nameLengthMax = Math.max(
      ...[...devices.keys()].map(name => name.length),
    )

    return from(
      inquirer.prompt<{ device: string }>([
        {
          name: 'device',
          message: 'select a device or execute a command',
          type: 'list',
          choices: [
            ...[...devices].sort().map(([name, infos]) => ({
              name: `${name.padEnd(nameLengthMax)}  -  ${infos.ip}`,
              value: name,
              short: infos.ip,
            })),
            new inquirer.Separator(),
            {
              name: 'scan again',
              value: 'scan',
            },
          ],
        },
      ]),
    ).pipe(
      map(answers => {
        if (answers.device === 'scan') throw new NewScanRequired()
        const selectedDevice = devices.get(answers.device)
        if (!selectedDevice) throw new DeviceNotFoundError()
        return selectedDevice
      }),
    )
  }
}
