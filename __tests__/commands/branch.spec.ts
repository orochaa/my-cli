import cp from 'node:child_process'
import * as p from '@clack/prompts'
import { makeSut } from '../mocks/make-sut'

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => 'master')
}))

describe('branch', () => {
  const sut = makeSut('branch')

  beforeAll(() => {
    jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as never))
    jest.spyOn(cp, 'exec').mockImplementationOnce((cmd, cb) => {
      ;(cb as any)(null, '', '')
      return cp as any
    })
  })

  it('should read git branches', async () => {
    await sut.exec()

    expect(cp.exec).toHaveBeenCalledTimes(1)
    expect(cp.exec).toHaveBeenCalledWith('git branch -a', expect.any(Function))
  })

  it('should checkout to selected local branch', async () => {
    ;(p.select as jest.Mock).mockResolvedValueOnce('   master')

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git checkout master',
      expect.anything()
    )
  })

  it('should pull selected remote branch', async () => {
    ;(p.select as jest.Mock).mockResolvedValueOnce(
      '   remotes/origin/pull_request/test'
    )

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git checkout -b pull_request/test',
      expect.anything()
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      'git pull origin pull_request/test',
      expect.anything()
    )
  })
})
