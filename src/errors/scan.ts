export class ScanUnknownError extends Error {
  constructor() {
    super('Unknown error while scanning for devices')
  }
}

export class NewScanRequired extends Error {
  constructor() {
    super('A new scan is required')
  }
}
