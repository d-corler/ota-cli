import {Command, Flags} from '@oclif/core'
import mdns from 'multicast-dns'
import {catchError, defer, lastValueFrom, tap, switchMap, of} from 'rxjs'

import constants from '../../constants'

import {SpinnerHelper, SpinnerStoppingState} from '../../utils/spinner'

import {Scanner} from '../../functions/scanner'

import {NewScanRequired} from '../../errors/scan.errors'

export default class Upload extends Command {
  static description = 'Upload a firmware to a device';

  static flags = {
    file: Flags.string({
      char: 'f',
      description: 'Path to the firmware binary file',
      required: true,
      helpValue: 'path/to/firmware.bin',
    }),
    interface: Flags.string({
      char: 'i',
      description: 'Provide IP of your default local network interface',
      required: true,
    }),
    deviceIp: Flags.string({
      description:
        'Skip the scanning step by providing the device IP address directly',
      required: false,
      helpValue: 'path/to/firmware.bin',
    }),
    devicePass: Flags.string({
      description:
        'Skip the authentication step by providing the password directly',
      required: false,
      dependsOn: ['ip'],
    }),
    dnsServiceName: Flags.string({
      description: 'Provide the name of the DNS service to lookup',
      required: false,
      default: constants.SERVICE_TARGET_NAME,
    }),
    dnsServiceType: Flags.string({
      description: 'Provide the type of the DNS service to lookup',
      required: false,
      default: constants.SERVICE_TARGET_TYPE,
    }),
  };

  static scanner = new Scanner();

  async run(): Promise<void> {
    const {flags} = await this.parse(Upload)

    const mdnsClient = mdns({
      interface: flags.interface,
    })

    const scanAndSelect = <
      T extends {
        flags: {
          file: string;
          interface: string;
          deviceIp: string | undefined;
          devicePass: string | undefined;
          dnsServiceName: string;
          dnsServiceType: string;
        };
        mdnsClient: mdns.MulticastDNS;
      }
    >(
        cache: T,
      ): // TODO fix this typing
    any =>
        of(cache).pipe(
        // Scan for devices
          switchMap(nestedCache =>
            defer(() => {
            // Start spinner
              SpinnerHelper.start('scanning')
              return (
              // Scan devices
                Upload.scanner
                .operate('scan')(nestedCache)
                .pipe(
                  // Stop spinner
                  tap(() => SpinnerHelper.stop(SpinnerStoppingState.Success)),
                )
              )
            }).pipe(
              catchError(error => {
              // Stop spinner
                SpinnerHelper.stop(SpinnerStoppingState.Failure)
                throw error
              }),
            ),
          ),
          // Select a device
          switchMap(nestedCache =>
            Upload.scanner
            .operate('select')(nestedCache)
            .pipe(
              catchError(error => {
                if (error instanceof NewScanRequired) {
                  return of(nestedCache).pipe(
                    switchMap(() => scanAndSelect(cache)),
                  )
                }

                throw error
              }),
            ),
          ),
        )

    return lastValueFrom(
      of({
        flags,
        mdnsClient,
      }).pipe(
        // Scan devices and select one
        switchMap(scanAndSelect),

        // eslint-disable-next-line unicorn/no-useless-undefined
        switchMap(() => of(undefined)),

        tap(() => {
          this.exit()
        }),
      ),
    )
  }
}
