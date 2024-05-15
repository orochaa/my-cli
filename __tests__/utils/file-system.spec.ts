import { cwd, packageJsonPath } from '@/utils/constants.js'
import { readPackageJson } from '@/utils/file-system.js'
import fs from 'node:fs'
import path from 'node:path'

describe('file-system', () => {
  beforeAll(() => {
    jest.spyOn(global.process, 'exit').mockImplementation()
  })

  describe('readPackageJson()', () => {
    it('should return parsed package.json', () => {
      const result = readPackageJson()
      const expected = JSON.parse(
        fs.readFileSync(path.join(cwd, 'package.json')).toString(),
      )
      expect(result).toStrictEqual(expected)
    })

    it('should return null if there is no package.json', () => {
      const packageContent = fs.readFileSync(packageJsonPath).toString()
      fs.rmSync(packageJsonPath)

      const result = readPackageJson()
      fs.writeFileSync(packageJsonPath, packageContent)

      expect(result).toBeNull()
    })
  })
})
