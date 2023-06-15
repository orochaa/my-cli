import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import cp from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => ['lint', 'build'])
}))

jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as any))

describe('run', () => {
  const sut = makeSut('run')

  beforeEach(() => {
    clearParams()
  })

  describe('shallowRun', () => {
    it('should verify package.json scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce(null)
      mockParams('lint')

      expect(sut.exec()).rejects.toThrowError(NotFoundError)
    })

    it('should verify if script exists in package.json', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {}
      })
      mockParams('lint')

      expect(sut.exec()).rejects.toThrowError(NotFoundError)
    })

    it('should run scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {
          lint: ' ',
          build: ' '
        }
      })

      mockParams('lint', 'build')
      await sut.exec()

      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything()
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run build',
        expect.anything()
      )
    })
  })

  describe('deepRun', () => {
    beforeAll(() => {
      writeFileSync(
        join(cwd, '__tests__', 'package.json'),
        JSON.stringify({
          scripts: {
            lint: ' ',
            test: ' '
          }
        })
      )
    })

    afterEach(() => {
      process.chdir(cwd)
    })

    afterAll(() => {
      rmSync(join(cwd, '__tests__', 'package.json'))
    })

    it('should run scripts of each package.json', async () => {
      mockParams('lint', 'build', 'test', '-d')
      await sut.exec()

      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything()
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run test',
        expect.anything()
      )
    })
  })

  describe('promptRun', () => {
    it('should verify package.json', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce(null)

      expect(sut.exec()).rejects.toThrowError(NotFoundError)
    })

    it('should verify package.json scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({})

      expect(sut.exec()).rejects.toThrowError(NotFoundError)
    })

    it("should run prompt's selected scripts", async () => {
      await sut.exec()

      expect(cp.execSync).toHaveBeenCalledTimes(2)
      expect(cp.execSync).toHaveBeenCalledWith(
        'npm run lint',
        expect.anything()
      )
      expect(cp.execSync).toHaveBeenCalledWith(
        'npm run build',
        expect.anything()
      )
    })
  })
})
