import { join } from 'node:path'

export const cwd = process.cwd()

export const packageJsonPath = join(cwd, 'package.json')

export const lockfilePath = join(__dirname, 'store-lock.json')

export const root =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? join(__dirname, '..', '..')
    : join(__dirname, '..')
