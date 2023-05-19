import {
  cwd,
  lockfilePath,
  packageJsonPath,
  tempFolderPath
} from '@/utils/constants'
import {
  getPackageJson,
  readLockfile,
  verifyLockfile,
  writeLockfile
} from '@/utils/file-system'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

const exitSpy = jest.spyOn(global.process, 'exit')
exitSpy.mockImplementation(() => ({} as never))

describe('file-system', () => {
  afterAll(() => {
    if (existsSync(lockfilePath)) rmSync(lockfilePath)
  })

  describe('getPackageJson()', () => {
    it('should return parsed package.json', () => {
      const result = getPackageJson()
      const expected = JSON.parse(
        readFileSync(join(cwd, 'package.json')).toString()
      )
      expect(result).toStrictEqual(expected)
    })

    it('should return null if there is no package.json', () => {
      const packageContent = readFileSync(packageJsonPath).toString()
      rmSync(packageJsonPath)

      const result = getPackageJson()
      writeFileSync(packageJsonPath, packageContent)

      expect(result).toBeNull()
    })
  })

  describe('verifyLockfile()', () => {
    it('should return true if there is a lockfile', () => {
      if (!existsSync(lockfilePath)) writeLockfile({})

      const result = verifyLockfile()

      expect(result).toBeTruthy()
    })

    it('should return false if there is not a lockfile', () => {
      if (existsSync(lockfilePath)) rmSync(lockfilePath)

      const result = verifyLockfile()

      expect(result).toBeFalsy()
    })
  })

  describe('readLockfile()', () => {
    it('should return parsed lockfile', () => {
      const mock = { test: 'foo' }
      writeLockfile(mock)

      const result = readLockfile()

      expect(result).toStrictEqual(mock)
    })
  })

  describe('writeLockfile()', () => {
    it('should create temp folder', () => {
      if (existsSync(tempFolderPath))
        rmSync(tempFolderPath, { recursive: true })

      writeLockfile({})

      expect(existsSync(tempFolderPath)).toBeTruthy()
    })

    it('should write lockfile', () => {
      if (existsSync(lockfilePath)) rmSync(lockfilePath)

      const mock = { test: 'foo' }
      writeLockfile(mock)

      expect(readLockfile()).toStrictEqual(mock)
    })
  })
})
