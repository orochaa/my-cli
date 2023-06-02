import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { cwd, lockfilePath } from '@/utils/constants'
import { InvalidParamError, NotFoundError } from '@/utils/errors'
import { writeLockfile } from '@/utils/file-system'
import cp from 'node:child_process'
import { existsSync, mkdirSync, rmSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import axios from 'axios'
import * as p from '@clack/prompts'

const repo = {
  name: 'my-cli',
  clone_url: 'https://github.com/Mist3rBru/my-cli.git',
  updated_at: new Date()
}

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => repo)
}))

jest.mock('axios', () => ({
  get: jest.fn(async () => ({
    data: [
      { updated_at: new Date().setDate(-1) },
      { updated_at: new Date().setDate(1) },
      { updated_at: new Date().setDate(-1) },
      repo
    ]
  }))
}))

describe('clone', () => {
  const sut = makeSut('clone')

  beforeAll(() => {
    writeLockfile({
      git: 'any-git'
    })

    jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as never))
  })

  beforeEach(() => {
    clearParams()
  })

  afterAll(() => {
    if (existsSync(lockfilePath)) {
      rmSync(lockfilePath)
    }
  })

  it('should get github repositories', async () => {
    await sut.exec()

    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it('should throw on invalid repository name', async () => {
    mockParams('your-cli')

    expect(sut.exec()).rejects.toThrowError(NotFoundError)
  })

  it('should clone on valid repository', async () => {
    mockParams('my-cli')

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      [
        `git clone ${repo.clone_url} ${repo.name}`,
        `cd ${repo.name}`,
        'git remote rename origin o',
        'pnpm install',
        'code .'
      ].join(' && '),
      expect.anything()
    )
  })

  it('should still prepare pre-cloned repository', async () => {
    const repositoryPath = join(cwd, 'my-cli')
    if (!existsSync(repositoryPath)) mkdirSync(repositoryPath)

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      [`cd ${repo.name}`, 'pnpm install', 'code .'].join(' && '),
      expect.anything()
    )
    rmdirSync(repositoryPath)
  })

  it('should render prompts', async () => {
    await sut.exec()

    expect(p.select).toHaveBeenCalledTimes(1)
  })
})
