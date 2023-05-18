import { resolve } from 'node:path'

export const cwd = process.cwd()

export const tempFolderPath =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? resolve(__dirname, '..', 'temp')
    : resolve(__dirname, 'temp')

export const lockfilePath = resolve(tempFolderPath, 'store-lock.json')

export const packageJsonPath = resolve(cwd, 'package.json')
