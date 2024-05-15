import { makeSut } from '@/tests/mocks/make-sut.js'
import { mockJsonParse } from '@/tests/mocks/utils.js'
import { cwd } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import cp from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { detect } from '@antfu/ni'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(() => ['lint', 'build']),
  outro: jest.fn(),
}))

jest.mock('@antfu/ni', () => ({
  detect: jest.fn(() => 'yarn'),
}))

describe('run', () => {
  const sut = makeSut('run')

  beforeAll(() => {
    jest.spyOn(cp, 'execSync').mockImplementation()
  })

  describe('shallowRun', () => {
    beforeEach(() => {
      mockJsonParse({
        scripts: {
          lint: ' ',
          build: ' ',
        },
      })
    })

    it('should run scripts', async () => {
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
        'npx test',
        expect.anything(),
      )
    })

    it('should run custom scripts', async () => {
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
        'npx vitest --run',
        expect.anything(),
      )
    })

    it('should run scripts partially', async () => {
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
      mockJsonParse(null)

      const promise = sut.exec('lint')

      await expect(promise).rejects.toThrow(NotFoundError)
    })

    it('should verify package.json scripts', async () => {
      mockJsonParse({})

      const promise = sut.exec('lint')

      await expect(promise).rejects.toThrow(NotFoundError)
    })

    it('should run install with the right package manager', async () => {
      mockJsonParse({ scripts: { install: ' ', lint: ' ' } })

      await sut.exec('install lint')

      expect(detect).toHaveBeenCalledTimes(1)
      expect(cp.execSync).toHaveBeenCalledTimes(2)
      expect(cp.execSync).toHaveBeenCalledWith(
        'yarn install',
        expect.anything(),
      )
      expect(cp.execSync).toHaveBeenCalledWith(
        'npm run lint',
        expect.anything(),
      )
    })

    it('should run install with default package manager', async () => {
      mockJsonParse({ scripts: { install: ' ' } })
      ;(detect as jest.Mock).mockReturnValueOnce(null)

      await sut.exec('install')

      expect(detect).toHaveBeenCalledTimes(1)
      expect(cp.execSync).toHaveBeenCalledTimes(1)
      expect(cp.execSync).toHaveBeenCalledWith(
        'pnpm install',
        expect.anything(),
      )
    })
  })

  describe('deepRun', () => {
    beforeAll(() => {
      writeFileSync(path.join(cwd, 'scripts/package.json'), '')
      mockJsonParse({
        scripts: {
          lint: ' ',
          build: ' ',
        },
      })
    })

    afterEach(() => {
      process.chdir(cwd)
    })

    afterAll(() => {
      rmSync(path.join(cwd, 'scripts/package.json'))
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
        'npx test',
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
    beforeEach(() => {
      mockJsonParse({
        scripts: {
          lint: ' ',
          build: ' ',
        },
      })
    })

    it('should verify package.json', async () => {
      mockJsonParse(null)
      await expect(sut.exec()).rejects.toThrow(NotFoundError)
    })

    it('should verify package.json scripts', async () => {
      mockJsonParse({})
      await expect(sut.exec()).rejects.toThrow(NotFoundError)
    })

    it('should print `run` command', async () => {
      await sut.exec()
      expect(p.outro).toHaveBeenCalledWith('my run lint build')
    })

    it("should run prompt's selected scripts", async () => {
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
