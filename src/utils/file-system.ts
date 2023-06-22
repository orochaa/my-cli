import { lockfilePath, packageJsonPath } from '@/utils/constants'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

export type PackageJson = {
  scripts: Record<string, string>
}

export function getPackageJson(path = packageJsonPath): PackageJson | null {
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
  writeFileSync(lockfilePath, JSON.stringify(content))
}
