import { packageJsonPath } from '@/utils/constants.js'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
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
