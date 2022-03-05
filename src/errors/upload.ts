export class PasswordRequired extends Error {
  constructor() {
    super('Password required')
  }
}

export class InvitationTimeout extends Error {
  constructor() {
    super('Invitation timeout')
  }
}

export class InvitationUnknownResponse extends Error {
  constructor() {
    super('Invitation unknown response')
  }
}

export class InvitationIncompatibleResponse extends Error {
  constructor() {
    super('Invitation incompatible response')
  }
}

export class AuthenticationTimeout extends Error {
  constructor() {
    super('Authentication timeout')
  }
}

export class AuthenticationFailed extends Error {
  constructor() {
    super('Authentication failed')
  }
}

export class AuthenticationUnknownResponse extends Error {
  constructor() {
    super('Authentication unknown response')
  }
}

export class ConnectionTimeout extends Error {
  constructor() {
    super('Connection timeout')
  }
}

export class UploadTimeout extends Error {
  constructor() {
    super('Upload timeout')
  }
}

export class UploadUnknownError extends Error {
  constructor() {
    super('Upload unknown error')
  }
}

export class MustBeValidIpAddress extends Error {
  constructor() {
    super('must be a valid IP address')
  }
}
