import path from 'path'
import {Worker} from 'worker_threads'
import {Observable} from 'rxjs'

export type Options = {
  workerName?: string;
};

/**
 * Service factory
 * @abstract
 */
export abstract class ServiceFactory {
  /**
   * Options
   * @protected
   */
  protected _options: Options;

  /**
   * @protected
   * @param {Options} options Options
   */
  protected constructor(options: Options) {
    this._options = options
  }

  /**
   * Create worker
   * @protected
   * @param {Data} workerData Worker data
   * @returns {Observable<any>} Worker observable
   */
  protected createWorker<Data extends any, Result extends any>(
    workerData: Data,
  ): Observable<Result> {
    return new Observable(observer => {
      const fileName = path.resolve(
        __dirname,
        `../workers/${this._options.workerName}.js`,
      )

      const worker = new Worker(fileName, {workerData})

      worker.on('message', message => observer.next(message))
      worker.on('error', error => observer.error(error))
      worker.on('exit', code => {
        if (code === 0) {
          observer.complete()
          return
        }

        observer.error(`worker stopped with exit code ${code}`)
      })
    })
  }
}
