import type { App } from '@/main/app.js'
import { exec, execAsync, hasFlag, logCommand } from '@/utils/cmd.js'
import { cwd, maxItems } from '@/utils/constants.js'
import { InvalidParamError, NotFoundError } from '@/utils/errors.js'
import { getLockfile } from '@/utils/lockfile.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { detect as detectPackageManager } from '@antfu/ni'
import axios from 'axios'
import * as p from '@clack/prompts'

export interface Repository {
  name: string
  clone_url: string
  updated_at: string
  [k: string]: string
}

type PackageManager = 'npm' | 'yarn' | 'pnpm'

async function cloneCommand(params: string[], flags: string[]): Promise<void> {
  const repository = await getRepository(params, flags)

  const projectPath = await formatProjectPath(repository.name)
  const isCloned = existsSync(projectPath)

  if (isCloned) {
    logCommand(`cd ${projectPath}`)
    process.chdir(projectPath)
  } else {
    exec(`git clone ${repository.clone_url} ${projectPath}`)
    logCommand(`cd ${projectPath}`)
    process.chdir(projectPath)
    exec('git remote rename origin o')
  }

  const isNodeProject = existsSync(path.resolve(projectPath, 'package.json'))
  const isGoProject =
    !isNodeProject && existsSync(path.resolve(projectPath, 'go.mod'))

  if (isNodeProject) {
    const packageManager =
      (await detectPackageManager()) ?? (await selectPackageManagerPrompt())
    exec(`${packageManager} install`)
  } else if (isGoProject) {
    exec('go mod download')
  }

  exec('code .')
}

async function getRepository(
  params: string[],
  flags: string[],
): Promise<Repository> {
  const isGithubUrl = /github\.com.+\.git$/.test(params[0])

  if (isGithubUrl) {
    const repositoryUrl = params[0]

    return {
      clone_url: repositoryUrl,
      name: repositoryUrl.replace(/.+\/(.+)\.git$/, '$1'),
      updated_at: '',
    }
  }

  const repositories = await getUserRepositories()
  const isFilter = hasFlag(['--filter', '-f'], flags)

  if (params.length > 0 && isFilter) {
    const filterRegex = new RegExp(params.join('|'), 'i')
    const filteredRepositories = repositories.filter(repository =>
      filterRegex.test(repository.name),
    )

    if (filteredRepositories.length === 0) {
      throw new InvalidParamError('filter param', 'No repository found')
    }

    if (filteredRepositories.length === 1) {
      return filteredRepositories[0]
    }

    return selectRepositoryPrompt(filteredRepositories)
  }

  if (params.length > 0) {
    const repositoryName = params[0]

    const repositoryRegex = new RegExp(repositoryName, 'i')
    const filteredRepositories = repositories.filter(repository =>
      repositoryRegex.test(repository.name),
    )

    if (filteredRepositories.length === 0) {
      throw new NotFoundError(repositoryName)
    }

    const desiredRepository =
      filteredRepositories.find(
        repository => repository.name === repositoryName,
      ) ?? filteredRepositories[0]

    return desiredRepository
  }

  return selectRepositoryPrompt(repositories)
}

async function getUserRepositories(): Promise<Repository[]> {
  const getGithubCliRepositories = async (): Promise<Repository[]> => {
    const authStatus = await execAsync('gh auth status')

    if (!authStatus.includes('Logged in')) {
      return []
    }

    const repositoriesData = await execAsync('gh repo list -L 50')
    const repositories = repositoriesData
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const username = line.replace(/^(.+?)\/.+/, '$1')
        const repositoryName = line.replace(/^.+?\/(.+?)\s.+/, '$1')
        const updatedAt = line.replace(/.+\s(.+)$/, '$1')

        return {
          name: repositoryName,
          clone_url: `https://github.com/${username}/${repositoryName}.git`,
          updated_at: updatedAt,
        } satisfies Repository
      })

    return repositories
  }

  const getGithubApiRepositories = async (): Promise<Repository[]> => {
    const username = await getLockfile('userGithubName')
    const { data: repositories } = await axios.get<Repository[]>(
      `https://api.github.com/users/${username}/repos`,
      { data: { username } },
    )

    return repositories
  }

  const githubRepositories = await Promise.all([
    getGithubApiRepositories(),
    getGithubCliRepositories(),
  ])

  const deduplicatedRepositories = githubRepositories
    .flat()
    .filter(
      (repo, i, arr) => i === arr.findIndex(_repo => _repo.name === repo.name),
    )

  return deduplicatedRepositories
}

async function formatProjectPath(repositoryName: string): Promise<string> {
  return hasFlag('--root')
    ? path.resolve(
        // eslint-disable-next-line unicorn/no-await-expression-member
        (await getLockfile('projectsRootList'))[0],
        repositoryName,
      )
    : path.resolve(cwd, repositoryName)
}

async function selectRepositoryPrompt(
  repositories: Repository[],
): Promise<Repository> {
  const sortedRepositories = repositories.sort((a, b) => {
    const date = [
      new Date(a.updated_at).getTime(),
      new Date(b.updated_at).getTime(),
    ]

    return date[0] > date[1]
      ? -1
      : date[0] < date[1]
        ? 1
        : a.name.localeCompare(b.name)
  })

  const response = await p.select({
    message: 'Select one of your repositories:',
    options: sortedRepositories.map(repository => ({
      label: repository.name,
      value: repository,
    })),
    initialValue: sortedRepositories[0],
    maxItems,
  })
  verifyPromptResponse(response)

  return response
}

async function selectPackageManagerPrompt(): Promise<PackageManager> {
  const options: PackageManager[] = ['pnpm', 'yarn', 'npm']
  const response = await p.select({
    message: 'Select your package manager:',
    options: options.map(pm => ({ value: pm })),
    initialValue: options[0],
    maxItems,
  })
  verifyPromptResponse(response)

  return response
}

export function cloneRecord(app: App): void {
  app.register({
    name: 'clone',
    alias: null,
    params: ['<repository>'],
    flags: ['--root', '--filter', '-f'],
    description:
      "Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode",
    example: 'my clone my-cli',
    action: cloneCommand,
  })
}
