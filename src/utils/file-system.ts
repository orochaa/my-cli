import { errorHandler } from '@/utils/cmd'
import {
  lockfilePath,
  packageJsonPath,
  tempFolderPath
} from '@/utils/constants'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

export type PackageJson = {
  scripts: Record<string, string>
}

export function getPackageJson(path = packageJsonPath): PackageJson | null {
  if (!existsSync(path)) {
    return null
  }
  return JSON.parse(readFileSync(path).toString())
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
  return JSON.parse(readFileSync(lockfilePath).toString())
}

export function writeLockfile(content: Record<string, unknown>): void {
  createTempFolder()
  writeFileSync(lockfilePath, JSON.stringify(content))
}

function createTempFolder(): void {
  if (!existsSync(tempFolderPath)) mkdirSync(tempFolderPath)
}
