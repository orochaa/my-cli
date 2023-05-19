import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { lockfilePath } from '@/utils/constants'
import { writeLockfile } from '@/utils/file-system'
import { existsSync, rmSync } from 'node:fs'
import * as p from '@clack/prompts'
import { makeSut } from '../mocks/make-sut'

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => 'any-git'),
  outro: jest.fn()
}))

jest.spyOn(global.process, 'exit').mockImplementation(() => ({} as never))

describe('recover', () => {
  const sut = makeSut('recover')

  beforeAll(() => {
    writeLockfile({
      git: 'any-git',
      projects: ['any-project', 'other-project']
    })
  })

  beforeEach(() => {
    clearParams()
  })

  afterAll(() => {
    if (existsSync(lockfilePath)) {
      rmSync(lockfilePath)
    }
  })

  it('should recover value of prompt selected key', async () => {
    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith('any-git')
  })

  it('should recover value of param key', async () => {
    mockParams('projects')

    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith('any-project')
    expect(p.outro).toHaveBeenCalledWith('other-project')
  })

  it("should print 'undefined' on not found param key", async () => {
    mockParams('invalid-param')

    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith('undefined')
  })

  it('should verify lockfile length', async () => {
    writeLockfile({})

    await sut.exec()

    expect(process.exit).toHaveBeenCalledTimes(1)
  })
})
