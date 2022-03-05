import validator from 'validator'
import {z} from 'zod'
import {MustBeValidIpAddress} from '../errors/upload'
import {RecordTypeEnum} from '../types/dns'

const ip = z.string().refine(validator.isIP, {
  message: new MustBeValidIpAddress().message,
})

export const scanArgumentsValidator = z.object({
  interfaceIp: ip,
  dnsServiceName: z.string(),
  dnsServiceType: RecordTypeEnum,
})

export const uploadArgumentsValidator = z.object({
  binaryFilePath: z.string(),
  deviceIp: ip,
  devicePort: z.number().int(),
  password: z.string().optional(),
})
