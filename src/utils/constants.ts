import { join } from 'node:path'

export const cwd = process.cwd()

export const packageJsonPath = join(cwd, 'package.json')

export const lockfilePath = join(__dirname, 'store-lock.json')
