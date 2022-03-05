import {RecordTypeEnum} from './types/dns'

export const CHUNK_SIZE = 2048

export const DEVICES_SCAN_DURATION = 5000

export const DEFAULT_SERVICE_TARGET_NAME = '_arduino._tcp.local'
export const DEFAULT_SERVICE_TARGET_TYPE: RecordTypeEnum = 'PTR'

export const U_FLASH = 0
export const U_AUTH = 200

export const WORKER_COMPLETE_SIGNAL = 'complete'
export const WORKER_TIMEOUT_SIGNAL = 'timeout'

export default {
  CHUNK_SIZE,
  DEVICES_SCAN_DURATION,
  DEFAULT_SERVICE_TARGET_NAME,
  DEFAULT_SERVICE_TARGET_TYPE,
  U_FLASH,
  U_AUTH,
}
