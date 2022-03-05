import {of, switchMap, map} from 'rxjs'
import {merge} from 'lodash'

import type {Observable} from 'rxjs'

export function createCache(): Observable<Record<string, unknown>>
export function createCache<O>(
  input: O,
): Observable<O>
export function createCache<O>(
  input?: O,
): Observable<O | Record<string, unknown>> {
  return of(input ?? {})
}

export function addToCache<T extends Record<string, unknown>, T2, T3>(
  observable: (cache: T) => Observable<T2>,
  cacheHandler: (output: T2) => T3,
): (source$: Observable<T>) => Observable<T & T3> {
  return (source$: Observable<T>) =>
    source$.pipe(
      switchMap(cache =>
        observable(cache).pipe(
          map(output => merge({}, cache, cacheHandler(output))),
        ),
      ),
    )
}
