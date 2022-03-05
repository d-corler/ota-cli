import {z} from 'zod'

import {WorkerCommandNotFound} from '../errors/worker'

import type {MessagePort} from 'worker_threads'
import type {Debugger} from 'debug'

/**
 * Worker factory
 */
export abstract class WorkerFactory<DataParser extends z.AnyZodObject> {
  public constructor(
    protected _debugLog: Debugger,
    protected _parent: MessagePort,
    protected _data: z.infer<DataParser>,
    protected _dataParser: DataParser,
  ) {
    _debugLog('constructed')
  }

  public run(): void {
    const data = this._dataParser.parse(this._data)

    const privateMethodName = `__${data.cmd}`
    this._debugLog(`running "${privateMethodName}"`)

    // Check if command method exists (must start with a double underscore)
    if (!(privateMethodName in this)) throw new WorkerCommandNotFound()
    // Call the method
    this.call(privateMethodName)()
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public call(method: string): Function {
    return (this as any)[method].bind(this)
  }
}
