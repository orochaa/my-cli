import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = fileURLToPath(new URL('.', import.meta.url))
export const cwd = process.cwd()

export const packageJsonPath = join(cwd, 'package.json')

export const lockfilePath = join(dirname, 'store-lock.json')

export const root =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? join(dirname, '..', '..')
    : join(dirname, '..')
