import { join } from 'node:path'

export const cwd = process.cwd()

export const tempFolderPath =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? join(__dirname, '..', 'temp')
    : join(__dirname, 'temp')

export const lockfilePath = join(tempFolderPath, 'store-lock.json')

export const packageJsonPath = join(cwd, 'package.json')
