import { errorHandler } from '@/utils/cmd'
import {
  packageJsonPath,
  storeLockFilePath,
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
  return existsSync(storeLockFilePath)
}

export type LockfileKey = 'git' | 'projects'
export type Lockfile = Record<LockfileKey, string> & Record<string, string>

export function readLockfile(): Lockfile {
  return JSON.parse(readFileSync(storeLockFilePath).toString())
}

export function writeLockfile(content: Record<string, string>): void {
  if (!existsSync(tempFolderPath)) mkdirSync(tempFolderPath)
  return writeFileSync(storeLockFilePath, JSON.stringify(content))
}
