/**
 * Device entity
 */
export class DeviceEntity {
  // eslint-disable-next-line no-useless-constructor
  constructor(public ip: string, public txt?: Record<string, string>) {}
}
