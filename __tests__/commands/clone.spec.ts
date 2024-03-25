import { makeSut } from '@/tests/mocks/make-sut.js'
import { mockExec, mockJsonParse } from '@/tests/mocks/utils.js'
import { cwd, maxItems } from '@/utils/constants.js'
import { InvalidParamError, NotFoundError } from '@/utils/errors.js'
import cp from 'node:child_process'
import fs from 'node:fs'
import { join, resolve } from 'node:path'
import { detect } from '@antfu/ni'
import axios from 'axios'
import * as p from '@clack/prompts'

const repo = {
  name: 'my-cli',
  clone_url: 'https://github.com/Mist3rBru/my-cli.git',
  updated_at: new Date().toISOString(),
}

const repositories = [
  {
    name: 'foo',
    updated_at: new Date().setDate(-1).toString(),
    clone_url: 'https://github.com/Mist3rBru/foo.git',
  },
  {
    name: 'bar',
    updated_at: new Date().setDate(1).toString(),
    clone_url: 'https://github.com/Mist3rBru/bar.git',
  },
  {
    name: 'baz',
    updated_at: new Date().setDate(-1).toString(),
    clone_url: 'https://github.com/Mist3rBru/baz.git',
  },
  repo,
]

jest.mock('@clack/prompts', () => ({
  select: jest.fn(() => repo),
}))

jest.mock('axios', () => ({
  get: jest.fn(() => ({
    data: repositories,
  })),
}))

jest.mock('@antfu/ni', () => ({
  detect: jest.fn(() => 'pnpm'),
}))

describe('clone', () => {
  const sut = makeSut('clone')

  const projectRoot = join(cwd, 'root')

  beforeAll(() => {
    jest.spyOn(process, 'chdir').mockImplementation()

    jest.spyOn(cp, 'execSync').mockImplementation()

    mockExec('')

    mockJsonParse({ projects: [projectRoot] })
  })

  it('should get github cli repositories', async () => {
    mockExec('Logged in', true)
    mockExec(
      repositories
        .map(
          repository =>
            `Mist3rBru/${repository.name}  ${repository.updated_at}`,
        )
        .join('\n'),
      true,
    )

    await sut.exec()

    expect(axios.get).toHaveBeenCalledTimes(0)
    expect(p.select).toHaveBeenLastCalledWith({
      initialValue: repositories[0],
      maxItems,
      message: 'Select one of your repositories:',
      options: repositories.map(rep => ({
        label: rep.name,
        value: rep,
      })),
    })
  })

  it('should get github api repositories', async () => {
    await sut.exec()

    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it('should throw on invalid repository name', async () => {
    const promise = sut.exec('your-cli')

    await expect(promise).rejects.toThrow(NotFoundError)
  })

  it('should clone on valid repository', async () => {
    await sut.exec('my-cli')
    const projectPath = resolve(cwd, repo.name)

    expect(cp.execSync).toHaveBeenCalledTimes(4)
    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
    expect(process.chdir).toHaveBeenCalledWith(projectPath)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git remote rename origin o',
      expect.anything(),
    )
    expect(cp.execSync).toHaveBeenCalledWith('pnpm install', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should clone http repository', async () => {
    await sut.exec(repo.clone_url)
    const projectPath = resolve(cwd, repo.name)

    expect(cp.execSync).toHaveBeenCalledTimes(4)
    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
    expect(process.chdir).toHaveBeenCalledWith(projectPath)
    expect(cp.execSync).toHaveBeenCalledWith(
      'git remote rename origin o',
      expect.anything(),
    )
    expect(cp.execSync).toHaveBeenCalledWith('pnpm install', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should clone repository on projects root', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false)

    await sut.exec('my-cli --root')
    const projectPath = join(projectRoot, 'my-cli')

    expect(cp.execSync).toHaveBeenCalledTimes(4)
    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
    expect(process.chdir).toHaveBeenCalledWith(projectPath)
    expect(cp.execSync).toHaveBeenCalledWith('pnpm install', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should filter repositories', async () => {
    await sut.exec('-f ba')

    const expectedRepositories = repositories.filter(rep =>
      /ba/i.test(rep.name),
    )

    expect(p.select).toHaveBeenCalledTimes(1)
    expect(p.select).toHaveBeenCalledWith({
      initialValue: expectedRepositories[0],
      maxItems,
      message: 'Select one of your repositories:',
      options: expectedRepositories.map(rep => ({
        label: rep.name,
        value: rep,
      })),
    })
  })

  it('should auto select filtered repository', async () => {
    await sut.exec('-f fo')

    expect(cp.execSync).toHaveBeenCalledTimes(4)
    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone https://github.com/Mist3rBru/foo.git ${resolve('foo')}`,
      expect.anything(),
    )
  })

  it('should throw on invalid repository filter', async () => {
    await expect(sut.exec('-f invalid_filter')).rejects.toThrow(
      InvalidParamError,
    )
  })

  it('should still prepare pre-cloned repository', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    await sut.exec()
    const projectPath = resolve(cwd, repo.name)

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(process.chdir).toHaveBeenCalledWith(projectPath)
    expect(cp.execSync).toHaveBeenCalledWith('pnpm install', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should not install non node project dependencies', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    await sut.exec()

    expect(cp.execSync).not.toHaveBeenCalledWith(
      'pnpm install',
      expect.anything(),
    )
    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })

  it('should render repository prompt', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    await sut.exec()

    expect(p.select).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith('pnpm install', expect.anything())
  })

  it('should render package manager prompt', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    ;(detect as jest.Mock).mockResolvedValueOnce(null)
    ;(p.select as jest.Mock)
      .mockResolvedValueOnce(repo)
      .mockResolvedValueOnce('npm')

    await sut.exec()

    expect(p.select).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith('npm install', expect.anything())
  })
})
