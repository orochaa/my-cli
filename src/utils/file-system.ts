import { errorHandler } from '@/utils/cmd'
import {
  lockfilePath,
  packageJsonPath,
  tempFolderPath
} from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

export type PackageJson = {
  scripts: Record<string, string>
}

export function getPackageJson(): PackageJson {
  if (!existsSync(packageJsonPath)) {
    return errorHandler(new NotFoundError('package.json'))
  }
  return JSON.parse(readFileSync(packageJsonPath).toString())
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
