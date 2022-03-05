export class WorkerCommandNotFound extends Error {
  constructor() {
    super(
      "command not found, don't forget to prefix the method with a double underscore",
    )
  }
}

export class WorkerTimeout extends Error {
  constructor() {
    super(
      'worker timeout',
    )
  }
}
