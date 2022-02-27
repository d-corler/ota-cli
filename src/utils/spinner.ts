import {cli} from 'cli-ux'

export enum SpinnerStoppingState {
  Success = 'success',
  Warning = 'warning',
  Failure = 'failure',
}

export class SpinnerHelper {
  /**
   * Start a spinner with a message
   * @param {string} msg Message to show
   * @returns void
   */
  public static start(msg: string): void {
    cli.action.start(`[\u001B[33mota\u001B[0m] ${msg}`)
  }

  /**
   * Stop a spinner with an optional message
   * @param {SpinnerStoppingState} state What's the state to use
   * @param {string=} msg Message to show
   * @returns void
   */
  public static stop(state: SpinnerStoppingState, msg?: string): void {
    // Check state value, don't trust typing
    if (!Object.values(SpinnerStoppingState).includes(state)) throw new Error('invalid state')

    const text = {
      [SpinnerStoppingState.Success]: '\u001B[32mdone\u001B[0m',
      [SpinnerStoppingState.Warning]: '\u001B[33mwarning\u001B[0m',
      [SpinnerStoppingState.Failure]: '\u001B[31mfailure\u001B[0m',
    }

    cli.action.stop([text[state], msg].filter(x => x?.length).join(' : ').trim())
  }
}
