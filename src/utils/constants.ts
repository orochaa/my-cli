import { join } from 'node:path'

export const cwd = process.cwd()

export const tempFolderPath = join(__dirname, '..', 'temp')

export const storeLockFilePath = join(tempFolderPath, 'store-lock.json')

export const projectsFolderPath = join('C:', 'git')

export const packageJsonPath = join(cwd, 'package.json')
