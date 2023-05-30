import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { lockfilePath } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { writeLockfile } from '@/utils/file-system'
import { existsSync, rmSync } from 'node:fs'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => 'any-git'),
  outro: jest.fn()
}))

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
    const git = 'any-git'
    ;(p.multiselect as jest.Mock).mockResolvedValueOnce([git])

    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith(git)
  })

  it('should recover values of prompt selected keys', async () => {
    const response = 'any-project,other-project'
    ;(p.multiselect as jest.Mock).mockResolvedValueOnce([response])

    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith(response)
  })

  it('should recover value of param key', async () => {
    mockParams('projects')

    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith('any-project,other-project')
  })

  it('should recover values of param keys', async () => {
    mockParams('projects', 'git')

    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith('any-project,other-project')
    expect(p.outro).toHaveBeenCalledWith('any-git')
  })

  it("should print 'undefined' on not found param key", async () => {
    mockParams('invalid-param')

    await sut.exec()

    expect(p.outro).toHaveBeenCalledWith('undefined')
  })

  it('should verify lockfile length', async () => {
    writeLockfile({})

    expect(sut.exec()).rejects.toThrowError(NotFoundError)
  })
})
