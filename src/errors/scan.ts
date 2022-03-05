export class ScanUnknownError extends Error {
  constructor() {
    super('unknown error while scanning for devices')
  }
}

export class NewScanRequired extends Error {
  constructor() {
    super('a new scan is required')
  }
}

export class DnsRecordTypeNotFound extends Error {
  constructor() {
    super('DNS record type not found')
  }
}
