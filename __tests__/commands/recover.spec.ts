import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { recoverCommand } from '@/commands'
import { writeLockfile } from '@/utils/file-system'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => 'any-git'),
  outro: jest.fn()
}))

jest.spyOn(global.process, 'exit').mockImplementation(() => ({} as never))

describe('recoverCommand', () => {
  beforeAll(() => {
    writeLockfile({
      git: 'any-git',
      projects: ['any-project', 'other-project']
    })
  })

  beforeEach(() => {
    clearParams()
  })

  it('should recover value of prompt selected key', async () => {
    await recoverCommand()

    expect(p.outro).toHaveBeenCalledWith('any-git')
  })

  it('should recover value of param key', async () => {
    mockParams(['projects'])

    await recoverCommand()

    expect(p.outro).toHaveBeenCalledWith('any-project')
    expect(p.outro).toHaveBeenCalledWith('other-project')
  })

  it('should print \'undefined\' on not found param key', async () => {
    mockParams(['invalid-param'])

    await recoverCommand()

    expect(p.outro).toHaveBeenCalledWith('undefined')
  })

  it('should verify lockfile length', async () => {
    writeLockfile({})

    await recoverCommand()

    expect(process.exit).toHaveBeenCalledTimes(1)
  })
})
