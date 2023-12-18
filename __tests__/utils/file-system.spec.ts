import { mockJsonParse } from '@/tests/mocks/utils.js'
import { cwd, lockfilePath, packageJsonPath } from '@/utils/constants.js'
import {
  getPackageJson,
  readLockfile,
  verifyLockfile,
  writeLockfile,
} from '@/utils/file-system.js'
import fs from 'node:fs'
import { join } from 'node:path'

describe('file-system', () => {
  beforeAll(() => {
    jest.spyOn(global.process, 'exit').mockImplementation()
  })

  describe('getPackageJson()', () => {
    it('should return parsed package.json', () => {
      const result = getPackageJson()
      const expected = JSON.parse(
        fs.readFileSync(join(cwd, 'package.json')).toString(),
      )
      expect(result).toStrictEqual(expected)
    })

    it('should return null if there is no package.json', () => {
      const packageContent = fs.readFileSync(packageJsonPath).toString()
      fs.rmSync(packageJsonPath)

      const result = getPackageJson()
      fs.writeFileSync(packageJsonPath, packageContent)

      expect(result).toBeNull()
    })
  })

  describe('verifyLockfile()', () => {
    it('should return true if there is a lockfile', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true)

      const result = verifyLockfile()

      expect(result).toBeTruthy()
    })

    it('should return false if there is not a lockfile', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false)

      const result = verifyLockfile()

      expect(result).toBeFalsy()
    })
  })

  describe('readLockfile()', () => {
    it('should return parsed lockfile', () => {
      const mock = { test: 'foo' }
      mockJsonParse(mock)

      const result = readLockfile()

      expect(result).toStrictEqual(mock)
    })
  })

  describe('writeLockfile()', () => {
    it('should write lockfile', () => {
      jest.spyOn(fs, 'writeFileSync').mockImplementation()
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false)

      const mock = { test: 'foo' }
      writeLockfile(mock)

      expect(fs.writeFileSync).toHaveBeenLastCalledWith(
        lockfilePath,
        JSON.stringify(mock),
      )
    })
  })
})
