import { branchCommand } from '@/commands'
import cp from 'node:child_process'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => 'master')
}))

describe('branchCommand', () => {
  beforeAll(() => {
    jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as never))
    jest.spyOn(cp, 'exec').mockImplementationOnce((cmd, cb) => {
      ;(cb as any)(null, '', '')
      return cp as any
    })
  })

  it('should read git branches', async () => {
    await branchCommand()

    expect(cp.exec).toHaveBeenCalledTimes(1)
    expect(cp.exec).toHaveBeenCalledWith('git branch -a', expect.any(Function))
  })

  it('should checkout to selected local branch', async () => {
    ;(p.select as jest.Mock).mockResolvedValueOnce('   master')

    await branchCommand()

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

    await branchCommand()

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
