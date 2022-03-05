import {singleton} from '../utils/di'
import inquirer from 'inquirer'
import {from, map, Observable} from 'rxjs'

import {RecordTypeEnum} from '../types/dns'
import {ScannerCommandEnum} from '../types/commands'

import {ServiceFactory} from '../factories/service'

import {scanArgumentsValidator} from '../validators/upload'

import {DeviceEntity} from '../entities/device'

import {DeviceNotFoundError} from '../errors/device'

/**
 * Scanner service
 */
@singleton()
export class ScannerService extends ServiceFactory {
  public constructor() {
    super({workerName: 'scanner'})
  }

  public parseScanArguments(
    interfaceIp: string,
    dnsServiceName: string,
    dnsServiceType: string,
  ): {
    interfaceIp: string;
    dnsServiceName: string;
    dnsServiceType: RecordTypeEnum;
  } {
    return scanArgumentsValidator.parse({
      interfaceIp,
      dnsServiceName,
      dnsServiceType,
    })
  }

  public scan(
    interfaceIp: string,
    dnsServiceName: string,
    dnsServiceType: RecordTypeEnum,
  ): Observable<any> {
    return this.createWorker({
      cmd: ScannerCommandEnum.Enum.scan,
      data: {
        interfaceIp,
        dnsServiceName,
        dnsServiceType,
      },
    })
  }

  /**
   * Select a device from a list of devices
   * @param {Map<string, DeviceEntity>} devices list of devices
   * @returns {Observable<DeviceEntity>} selected device
   */
  public select(devices: Map<string, DeviceEntity>): Observable<DeviceEntity> {
    const nameLengthMax = Math.max(
      ...[...devices.keys()].map(name => name.length),
    )

    return from(
      inquirer.prompt<{ device: string }>([
        {
          name: 'device',
          // TODO : change text when the re-scanning feature will be implemented
          message: 'select a device',
          type: 'list',
          choices: [
            ...[...devices].sort().map(([name, infos]) => ({
              name: `${name.padEnd(nameLengthMax)}  -  ${infos.ip}`,
              value: name,
              short: infos.ip,
            })),
            // TODO : implement the re-scanning feature
            /* new inquirer.Separator(),
            {
              name: 'scan again',
              value: 'scan',
            }, */
          ],
        },
      ]),
    ).pipe(
      map(answers => {
        // if (answers.device === 'scan') throw new NewScanRequired()
        const selectedDevice = devices.get(answers.device)
        if (!selectedDevice) throw new DeviceNotFoundError()
        return selectedDevice
      }),
    )
  }

  public selectPort(device: DeviceEntity): Observable<number> {
    // Try to autocomplete the port
    // TODO : add more entries into the list
    let defaultPort: number | undefined
    if (device.txt?.board) {
      const board = device.txt?.board.toLowerCase()
      if (board.includes('nodemcuv2')) defaultPort = 8266
    }

    return from(
      inquirer.prompt<{ port: string }>([
        {
          name: 'port',
          message: "what's the port to use ?",
          type: 'number',
          default: defaultPort,
        },
      ]),
    ).pipe(map(({port}) => Number.parseInt(port, 10)))
  }
}
