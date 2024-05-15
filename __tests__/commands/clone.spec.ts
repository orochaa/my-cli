import { makeSut } from '@/tests/mocks/make-sut.js'
import { mockExec, mockJsonParse } from '@/tests/mocks/utils.js'
import { cwd, maxItems } from '@/utils/constants.js'
import { InvalidParamError, NotFoundError } from '@/utils/errors.js'
import cp from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
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
].sort((a, b) => a.name.localeCompare(b.name))

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

  const projectRoot = path.join(cwd, 'root')

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
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: [] })

    await sut.exec()

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

  it('should clone on valid repository name', async () => {
    await sut.exec('my-cli')
    const projectPath = path.resolve(cwd, repo.name)

    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
  })

  it('should clone on valid repository url', async () => {
    await sut.exec(repo.clone_url)
    const projectPath = path.resolve(cwd, repo.name)

    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
  })

  it('should clone repository on projects root', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false)

    await sut.exec('my-cli --root')
    const projectPath = path.join(projectRoot, 'my-cli')

    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
  })

  it('should filter repositories', async () => {
    await sut.exec('-f ba')

    const expectedRepositories = repositories.filter(rep =>
      /ba/i.test(rep.name),
    )

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

    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone https://github.com/Mist3rBru/foo.git ${path.resolve('foo')}`,
      expect.anything(),
    )
  })

  it('should throw on invalid repository filter', async () => {
    await expect(sut.exec('-f invalid_filter')).rejects.toThrow(
      InvalidParamError,
    )
  })

  it('should rename git origin', async () => {
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledWith(
      'git remote rename origin o',
      expect.anything(),
    )
  })

  it('should not rename git origin from pre-cloned project', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    await sut.exec()

    expect(cp.execSync).not.toHaveBeenCalledWith(
      'git remote rename origin o',
      expect.anything(),
    )
  })

  it('should clone and enter cloned project', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    const projectPath = path.resolve(repo.name)
    await sut.exec(repo.name)

    expect(cp.execSync).toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
    expect(process.chdir).toHaveBeenCalledWith(projectPath)
  })

  it('should enter pre-cloned project', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    const projectPath = path.resolve(repo.name)
    await sut.exec(repo.name)

    expect(cp.execSync).not.toHaveBeenCalledWith(
      `git clone ${repo.clone_url} ${projectPath}`,
      expect.anything(),
    )
    expect(process.chdir).toHaveBeenCalledWith(projectPath)
  })

  it('should install node project dependencies', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledWith('pnpm install', expect.anything())
  })

  it('should install go project dependencies', async () => {
    jest
      .spyOn(fs, 'existsSync')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledWith(
      'go mod download',
      expect.anything(),
    )
  })

  it('should not install unknown project dependencies', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    await sut.exec()

    expect(cp.execSync).not.toHaveBeenCalledWith(
      'pnpm install',
      expect.anything(),
    )
    expect(cp.execSync).not.toHaveBeenCalledWith(
      'go mod download',
      expect.anything(),
    )
  })

  it('should render repository prompt', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    await sut.exec()

    expect(p.select).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith('pnpm install', expect.anything())
  })

  it('should render repository prompt then package manager prompt', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    ;(detect as jest.Mock).mockResolvedValueOnce(null)
    ;(p.select as jest.Mock)
      .mockResolvedValueOnce(repo)
      .mockResolvedValueOnce('npm')

    await sut.exec()

    expect(p.select).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith('npm install', expect.anything())
  })

  it('should open vscode editor', async () => {
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledWith('code .', expect.anything())
  })
})
