import crypto from 'crypto'

export function md5(data: crypto.BinaryLike): string {
  return crypto.createHash('md5').update(data).digest('hex')
}
