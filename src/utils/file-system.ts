import {
  lockfileDir,
  lockfilePath,
  packageJsonPath,
} from '@/utils/constants.js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

export type PackageJson = Partial<{
  version: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}>

export function getPackageJson(
  path: string = packageJsonPath,
): PackageJson | null {
  if (!existsSync(path)) {
    return null
  }

  return JSON.parse(readFileSync(path).toString()) as PackageJson
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
