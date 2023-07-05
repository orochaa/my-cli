import { makeSut } from '@/tests/mocks/make-sut'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import cp from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => ['lint', 'build'])
}))

jest.spyOn(cp, 'execSync').mockImplementation()

describe('run', () => {
  const sut = makeSut('run')

  describe('shallowRun', () => {
    it('should verify package.json scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce(null)

      const promise = sut.exec('lint')

      expect(promise).rejects.toThrow(NotFoundError)
    })

    it('should verify if script exists in package.json', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {}
      })

      const promise = sut.exec('lint')

      expect(promise).rejects.toThrow(NotFoundError)
    })

    it('should run scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {
          lint: ' ',
          build: ' '
        }
      })

      await sut.exec('lint', 'build')

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
      await sut.exec('lint', 'build', 'test', '-d')

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

      expect(sut.exec()).rejects.toThrow(NotFoundError)
    })

    it('should verify package.json scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({})

      expect(sut.exec()).rejects.toThrow(NotFoundError)
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
