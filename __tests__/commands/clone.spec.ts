import { makeSut } from '@/tests/mocks/make-sut.js'
import { cwd, lockfilePath } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import { writeLockfile } from '@/utils/file-system.js'
import cp from 'node:child_process'
import fs, { existsSync, mkdirSync, rmSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import { runCli as ni } from '@antfu/ni'
import axios from 'axios'
import * as p from '@clack/prompts'

const repo = {
  name: 'my-cli',
  clone_url: 'https://github.com/Mist3rBru/my-cli.git',
  updated_at: new Date(),
}

const repositoryPath = join(cwd, 'my-cli')

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => repo),
}))

jest.mock('axios', () => ({
  get: jest.fn(async () => ({
    data: [
      { updated_at: new Date().setDate(-1) },
      { updated_at: new Date().setDate(1) },
      { updated_at: new Date().setDate(-1) },
      repo,
    ],
  })),
}))

jest.mock('@antfu/ni', () => ({
  detect: jest.fn(() => 'pnpm'),
  parseNi: jest.fn(),
  runCli: jest.fn(),
}))

jest.spyOn(process, 'chdir').mockImplementation()

jest.spyOn(cp, 'execSync').mockImplementation()

describe('clone', () => {
  const sut = makeSut('clone')

  beforeAll(() => {
    writeLockfile({
      git: 'any-git',
    })
  })

  afterAll(() => {
    rmSync(lockfilePath)
  })

  it('should get github repositories', async () => {
    await sut.exec()

    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it('should throw on invalid repository name', async () => {
    const promise = sut.exec('your-cli')

    expect(promise).rejects.toThrow(NotFoundError)
  })

  it('should clone on valid repository', async () => {
    await sut.exec('my-cli')

    expect(cp.execSync).toHaveBeenCalledTimes(3)
    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${repo.name}`,
      expect.anything(),
    )
    expect(process.chdir).toHaveBeenCalledWith(repo.name)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git remote rename origin o',
      expect.anything(),
    )
    expect(ni).toHaveBeenCalled()
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should clone http repository', async () => {
    await sut.exec(repo.clone_url)

    expect(cp.execSync).toHaveBeenCalledTimes(3)
    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${repo.name}`,
      expect.anything(),
    )
    expect(process.chdir).toHaveBeenCalledWith(repo.name)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git remote rename origin o',
      expect.anything(),
    )
    expect(ni).toHaveBeenCalled()
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should still prepare pre-cloned repository', async () => {
    if (!existsSync(repositoryPath)) mkdirSync(repositoryPath)

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(process.chdir).toHaveBeenCalledWith(repo.name)
    expect(ni).toHaveBeenCalled()
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
    rmdirSync(repositoryPath)
  })

  it('should not install non node project dependencies', async () => {
    const existsSpy = jest
      .spyOn(fs, 'existsSync')
      .mockImplementation()
      .mockReturnValue(false)

    await sut.exec()

    expect(existsSpy).not.toHaveBeenCalledWith(
      'pnpm install',
      expect.anything(),
    )
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should render prompts', async () => {
    await sut.exec()

    expect(p.select).toHaveBeenCalledTimes(1)
  })
})
