import {
  lockfileDir,
  lockfilePath,
  packageJsonPath,
} from '@/utils/constants.js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { NotFoundError } from './errors.js'

export type PackageJson = Partial<{
  type: 'commonjs' | 'module'
  version: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}>

export function readPackageJson(
  path: string = packageJsonPath,
): PackageJson | null {
  if (!existsSync(path)) {
    return null
  }

  return JSON.parse(readFileSync(path).toString()) as PackageJson
}

export function writePackageJson(
  data: Record<string, unknown>,
  path: string = packageJsonPath,
): void {
  if (!existsSync(path)) {
    throw new NotFoundError('package.json')
  }

  writeFileSync(path, JSON.stringify(data, null, 2))
}

export function verifyLockfile(): boolean {
  return existsSync(lockfilePath)
}

export type LockfileKey = 'git' | 'projects'

export type Lockfile = {
  git: string
  projects: string[]
} & Record<string, string | string[]>

export function readLockfile(): Lockfile {
  return JSON.parse(readFileSync(lockfilePath).toString()) as Lockfile
}

export function writeLockfile(content: Record<string, unknown>): void {
  if (!existsSync(lockfileDir)) {
    mkdirSync(lockfileDir, { recursive: true })
  }
  writeFileSync(lockfilePath, JSON.stringify(content))
}
