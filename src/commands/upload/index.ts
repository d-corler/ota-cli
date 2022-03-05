import {autoInjectable} from '../../utils/di'
import {Flags, Config} from '@oclif/core'
import {
  catchError,
  defer,
  lastValueFrom,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs'

import constants from '../../constants'

import {CommandFactory} from '../../factories/command'

import {SpinnerHelper, SpinnerStoppingState} from '../../utils/spinner'

import {ScannerService} from '../../services/scanner'
import {UploaderService} from '../../services/uploader'

import {extractZodErrorMessage} from '../../utils/errors'

@autoInjectable()
export default class Upload extends CommandFactory {
  static description = 'Upload a firmware to a device';

  static flags = {
    ...CommandFactory.defaultFlags,
    file: Flags.string({
      char: 'f',
      description: 'Path to the firmware binary file',
      required: true,
      helpValue: 'path/to/firmware.bin',
    }),
    interfaceIp: Flags.string({
      char: 'i',
      description: 'Provide IP of your default local network interface',
      required: true,
    }),
    // TODO : to implement
    deviceIp: Flags.string({
      description:
        '(WIP) Skip the scanning step by providing the device IP address directly',
      required: false,
      helpValue: 'path/to/firmware.bin',
    }),
    devicePass: Flags.string({
      description:
        'Skip the authentication step by providing the password directly',
      required: false,
      // TODO : uncomment when deviceIp implemented
      // dependsOn: ['ip'],
    }),
    dnsServiceName: Flags.string({
      description: 'Provide the name of the DNS service to lookup',
      required: false,
      default: constants.DEFAULT_SERVICE_TARGET_NAME,
    }),
    dnsServiceType: Flags.string({
      description: 'Provide the type of the DNS service to lookup',
      required: false,
      default: constants.DEFAULT_SERVICE_TARGET_TYPE,
    }),
  };

  constructor(
    public argv: string[],
    public config: Config,
    private _scannerService: ScannerService,
    private _uploaderService: UploaderService,
  ) {
    super(argv, config)
  }

  async run() /* : Promise<void> */ {
    const {flags} = await this.parse(Upload)

    return lastValueFrom(
      defer(() => {
        const parsedScanArguments = this._scannerService.parseScanArguments(
          flags.interfaceIp,
          flags.dnsServiceName,
          flags.dnsServiceType,
        )

        // Start spinner
        SpinnerHelper.start('scanning')
        return this._scannerService
        .scan(
          parsedScanArguments.interfaceIp,
          parsedScanArguments.dnsServiceName,
          parsedScanArguments.dnsServiceType,
        )
        .pipe(take(1))
      }).pipe(
        // Stop spinner
        tap(() => SpinnerHelper.stop(SpinnerStoppingState.Success)),
        // Select the device
        switchMap(output => this._scannerService.select(output.result)),
        // Select the device port
        switchMap(output =>
          this._scannerService
          .selectPort(output)
          // Merge port with the device output
          .pipe(map(port => ({...output, port}))),
        ),
        // Upload file
        switchMap(device =>
          defer(() => {
            const parsedUploadArguments =
              this._uploaderService.parseUploadArguments(
                flags.file,
                device.ip,
                device.port,
                flags.devicePass,
              )

            // Start spinner
            SpinnerHelper.start('uploading')
            return this._uploaderService.upload(
              parsedUploadArguments.binaryFilePath,
              parsedUploadArguments.deviceIp,
              parsedUploadArguments.devicePort,
              parsedUploadArguments.password,
            )
          }),
        ),
        // Catch errors and display them
        catchError(error => {
          this.error(extractZodErrorMessage(error))
        }),
      ),
    )
    .then(() => {
      this.exit(0)
    })
    .catch(error => {
      SpinnerHelper.stop(SpinnerStoppingState.Failure)
      this.error(error)
    })
  }
}
