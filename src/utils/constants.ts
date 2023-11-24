import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = fileURLToPath(new URL('.', import.meta.url))
export const cwd = process.cwd()

export const packageJsonPath = join(cwd, 'package.json')

export const lockfileDir = join(homedir(), 'my-cli')
export const lockfilePath = join(lockfileDir, 'setup-lock.json')

export const root = ['development', 'test'].includes(process.env.NODE_ENV!)
  ? join(dirname, '..', '..')
  : join(dirname, '..')

export const maxItems = process.stdout.rows - 4
