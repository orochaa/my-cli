import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV)

export const packageName = '@mist3rbru/my-cli'

export const cwd = process.cwd()

export const root = path.join(dirname, isDevelopment ? '../..' : '..')

export const packageJsonPath = path.join(cwd, 'package.json')

export const myCliPackageJsonPath = path.join(root, 'package.json')

export const lockfileDir = path.join(homedir(), 'my-cli')

export const lockfilePath = path.join(lockfileDir, 'setup-lock.json')

export const maxItems = Math.max(process.stdout.rows - 4, 0)
