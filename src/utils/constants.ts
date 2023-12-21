import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV)

export const packageName = '@mist3rbru/my-cli'

export const cwd = process.cwd()
export const root = join(dirname, isDevelopment ? '../..' : '..')

export const packageJsonPath = join(cwd, 'package.json')
export const myCliPackageJsonPath = join(root, 'package.json')

export const lockfileDir = join(homedir(), 'my-cli')
export const lockfilePath = join(lockfileDir, 'setup-lock.json')

export const maxItems = process.stdout.rows - 4
