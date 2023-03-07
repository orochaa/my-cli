import { join, resolve } from 'node:path'

export const cwd = process.cwd()

export const tempFolderPath = resolve('..', 'temp')

export const storeLockFilePath = join(tempFolderPath, 'store-lock.json')

export const packageJsonPath = join(cwd, 'package.json')
