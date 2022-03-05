import '@abraham/reflection'
import debug from 'debug'
import {Command, Flags} from '@oclif/core'

export abstract class CommandFactory extends Command {
  static defaultFlags = {
    debug: Flags.string({required: false}),
  };

  async init(): Promise<void> {
    const {flags} = await this.parse(this.ctor)

    if (flags.debug) {
      debug.enable(flags.debug)
    }
  }
}
