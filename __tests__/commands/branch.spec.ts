import { makeSut } from '@/tests/mocks/make-sut.js'
import cp from 'node:child_process'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => '   master'),
}))

jest.spyOn(cp, 'execSync').mockImplementation()
jest.spyOn(cp, 'exec').mockImplementation((cmd, cb) => {
  ;(cb as any)(null, 'origin', '')
  return cp as any
})

describe('branch', () => {
  const sut = makeSut('branch')

  it('should read git branches', async () => {
    await sut.exec()

    expect(cp.exec).toHaveBeenCalled()
    expect(cp.exec).toHaveBeenCalledWith('git branch -a', expect.any(Function))
  })

  it('should checkout to selected local branch and pull origin', async () => {
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git checkout master',
      expect.anything(),
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      'git pull origin master',
      expect.anything(),
    )
  })

  it('should checkout to selected local branch and pull custom-origin', async () => {
    jest.spyOn(cp, 'exec').mockImplementation((cmd, cb) => {
      ;(cb as any)(null, 'custom-origin', '')
      return cp as any
    })

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git checkout master',
      expect.anything(),
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      'git pull custom-origin master',
      expect.anything(),
    )
  })

  it('should pull selected remote branch', async () => {
    ;(p.select as jest.Mock).mockResolvedValueOnce(
      '   remotes/origin/pull_request/test',
    )

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git checkout -b pull_request/test',
      expect.anything(),
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      'git pull origin pull_request/test',
      expect.anything(),
    )
  })
})
