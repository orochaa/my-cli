import { makeSut } from '@/tests/mocks/make-sut.js'
import { cwd } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import cp from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => ['lint', 'build']),
  outro: jest.fn(),
}))

jest.spyOn(cp, 'execSync').mockImplementation()

describe('run', () => {
  const sut = makeSut('run')

  describe('shallowRun', () => {
    it('should run scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {
          lint: ' ',
          build: ' ',
        },
      })

      await sut.exec('lint build test')

      expect(cp.execSync).toHaveBeenCalledTimes(3)
      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run build',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        3,
        'npx test\n',
        expect.anything(),
      )
    })

    it('should run custom scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {
          lint: ' ',
          build: ' ',
        },
      })

      await sut.execRaw('lint', 'build', 'vitest --run')

      expect(cp.execSync).toHaveBeenCalledTimes(3)
      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run build',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        3,
        'npx vitest --run\n',
        expect.anything(),
      )
    })

    it('should run scripts partially', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {
          lint: ' ',
          build: ' ',
        },
      })

      await sut.exec('lint build test -p')

      expect(cp.execSync).toHaveBeenCalledTimes(2)
      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run build',
        expect.anything(),
      )
    })

    it('should verify package.json', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce(null)

      const promise = sut.exec('lint')

      expect(promise).rejects.toThrow(NotFoundError)
    })

    it('should verify package.json scripts', async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({})

      const promise = sut.exec('lint')

      expect(promise).rejects.toThrow(NotFoundError)
    })
  })

  describe('deepRun', () => {
    beforeAll(() => {
      writeFileSync(
        join(cwd, 'scripts/package.json'),
        JSON.stringify({
          scripts: {
            lint: ' ',
            build: ' ',
          },
        }),
      )
    })

    afterEach(() => {
      process.chdir(cwd)
    })

    afterAll(() => {
      rmSync(join(cwd, 'scripts/package.json'))
    })

    it('should run scripts', async () => {
      await sut.exec('lint build test -d')

      expect(cp.execSync).toHaveBeenCalledTimes(3)
      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run build',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        3,
        'npx test\n',
        expect.anything(),
      )
    })

    it('should run scripts partially(of each package.json)', async () => {
      await sut.exec('lint build test -d -p')

      expect(cp.execSync).toHaveBeenCalledTimes(2)
      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run build',
        expect.anything(),
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

    it('should print `run` command', async () => {
      await sut.exec()
      expect(p.outro).toHaveBeenCalledWith('my run lint build')
    })

    it("should run prompt's selected scripts", async () => {
      jest.spyOn(JSON, 'parse').mockReturnValueOnce({
        scripts: {
          lint: ' ',
          build: ' ',
        },
      })

      await sut.exec()

      expect(cp.execSync).toHaveBeenCalledTimes(2)
      expect(cp.execSync).toHaveBeenNthCalledWith(
        1,
        'npm run lint',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenNthCalledWith(
        2,
        'npm run build',
        expect.anything(),
      )
    })
  })
})
