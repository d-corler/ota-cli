import {z} from 'zod'

export const ScannerCommandEnum = z.enum(['scan'])

export type ScannerCommandEnum = z.infer<typeof ScannerCommandEnum>;

export const UploaderCommandEnum = z.enum(['upload'])

export type UploaderCommandEnum = z.infer<typeof UploaderCommandEnum>;
