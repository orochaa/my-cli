import { join } from 'node:path'

export const tempPath = join(__dirname, '..', 'temp')

export const lockfilePath = join(tempPath, 'store-lock.json')
