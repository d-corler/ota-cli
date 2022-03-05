import {ZodError} from 'zod'

export function extractZodErrorMessage(error: Error): Error;
export function extractZodErrorMessage(error: ZodError): string;
export function extractZodErrorMessage(error: Error | ZodError): string | Error {
  if (error instanceof ZodError) {
    const errorMessage = error.errors
    .map(
      e =>
        `flag${e.path.length > 1 ? 's' : ''} ${e.path
        .map(p => `"${p}"`)
        .join(', ')} ${e.message}`,
    )
    .join('\n')
    return errorMessage
  }

  return error
}
