import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { cwd, lockfilePath } from '@/utils/constants'
import { writeLockfile } from '@/utils/file-system'
import cp from 'node:child_process'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { makeSut } from '../mocks/make-sut'

const projects = readdirSync(cwd).filter(folder => !/\.\w+$/.test(folder))

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => projects)
}))

jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as any))

describe('open', () => {
  const sut = makeSut('open')

  beforeAll(() => {
    writeLockfile({
      git: 'any-git',
      projects: [cwd]
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

  it('should open all prompt options', async () => {
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(projects.length)
  })

  it('should catch all parameters errors', async () => {
    mockParams('any-project', 'other-project')

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(0)
  })

  it('should open all parameters options', async () => {
    mockParams(...projects)

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(projects.length)
  })
})
