import { lockfilePath } from '@/utils/constants.js'
import {
  getLockfile,
  readLockfile,
  verifyLockfile,
  writeLockfile,
} from '@/utils/lockfile.js'
import type { Lockfile } from '@/utils/lockfile.js'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import { mockJsonParse } from '../mocks/utils.js'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(() => 'my-git'),
  confirm: jest.fn(() => true),
  spinner: () => ({
    start: () => {},
    stop: () => {},
  }),
}))

jest.mock('axios', () => ({
  get: jest.fn(() => ({ data: { user: {} } })),
}))

describe('lockfile', () => {
  describe('verifyLockfile()', () => {
    beforeAll(() => {
      jest.spyOn(global.process, 'exit').mockImplementation()
      jest.spyOn(fs, 'writeFileSync').mockImplementation()
    })

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

  describe('getLockfile', () => {
    it('should return lockfile key value', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true)
      const mock = { userGithubName: 'git-test' } satisfies Partial<Lockfile>
      mockJsonParse(mock)

      const value = await getLockfile('userGithubName')

      expect(value).toBe(mock.userGithubName)
    })

    it('should get lockfile key value though prompt', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false)
      ;(p.text as jest.Mock).mockResolvedValueOnce('my-git')

      const value = await getLockfile('userGithubName')

      expect(value).toBe('my-git')
    })

    it('should update lockfile', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false)
      ;(p.text as jest.Mock).mockResolvedValueOnce('my-git')

      await getLockfile('userGithubName')

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        lockfilePath,
        JSON.stringify({
          userGithubName: 'my-git',
        }),
      )
    })
  })
})
