import { App } from '@/main/app.js'
import { exec, hasFlag, logCommand } from '@/utils/cmd.js'
import { cwd, maxItems } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import { readLockfile } from '@/utils/file-system.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { detect } from '@antfu/ni'
import axios from 'axios'
import * as p from '@clack/prompts'

type Repository = {
  name: string
  clone_url: string
  updated_at: string
}

type PackageManager = 'npm' | 'yarn' | 'pnpm'

async function cloneCommand(params: string[], flags: string[]): Promise<void> {
  let repository: Repository

  if (params.length) {
    const repositoryName = params[0]
    if (/github\.com.+\.git$/.test(repositoryName)) {
      repository = {
        clone_url: repositoryName,
        name: repositoryName.replace(/.+\/(.+)\.git/, '$1'),
        updated_at: '',
      }
    } else {
      const repositories = await getUserRepositories()
      const foundRepository = repositories.find(
        repository => repository.name === repositoryName,
      )
      if (!foundRepository) {
        throw new NotFoundError(repositoryName)
      }
      repository = foundRepository
    }
  } else {
    const repositories = await getUserRepositories()
    repository = await clonePrompt(repositories)
  }

  const projectPath = formatProjectPath(repository.name)
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

  const isNodeProject = existsSync(resolve(process.cwd(), 'package.json'))
  if (isNodeProject) {
    const pm = (await detect()) || (await packageManagerPrompt())
    exec(`${pm} install`)
  }

  exec('code .')
}

async function getUserRepositories(): Promise<Repository[]> {
  const username = readLockfile().git
  const { data: repositories } = await axios.get<Repository[]>(
    `https://api.github.com/users/${username}/repos`,
    {
      data: {
        username,
      },
    },
  )
  return repositories
}

function formatProjectPath(repositoryName: string): string {
  return hasFlag('--root')
    ? resolve(readLockfile().projects[0], repositoryName)
    : resolve(cwd, repositoryName)
}

async function clonePrompt(repositories: Repository[]): Promise<Repository> {
  const sortedRepositories = repositories.sort((a, b) => {
    const date = [
      new Date(a.updated_at).getTime(),
      new Date(b.updated_at).getTime(),
    ]
    return date[0] > date[1] ? -1 : date[0] < date[1] ? 1 : 0
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

async function packageManagerPrompt(): Promise<PackageManager> {
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
    flags: ['--root'],
    description:
      "Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode",
    example: 'my clone my-cli',
    action: cloneCommand,
  })
}
