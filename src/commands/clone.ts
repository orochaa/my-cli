import { App } from '@/main/app'
import { exec } from '@/utils/cmd'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { readLockfile } from '@/utils/file-system'
import { verifyPromptResponse } from '@/utils/prompt'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import axios from 'axios'
import * as p from '@clack/prompts'

type Repository = {
  name: string
  clone_url: string
  updated_at: string
}

async function cloneCommand(params: string[]): Promise<void> {
  const repositories = await getUserRepositories()
  const repositoryName = params[0]
  let repository: Repository

  if (params.length) {
    const foundRepository = repositories.find(
      repository => repository.name === repositoryName
    )
    if (!foundRepository) {
      throw new NotFoundError(repositoryName)
    }
    repository = foundRepository
  } else {
    repository = await clonePrompt(repositories)
  }

  const shouldClone = !existsSync(join(cwd, repository.name))
  exec(
    [
      shouldClone && `git clone ${repository.clone_url} ${repository.name}`,
      `cd ${repository.name}`,
      shouldClone && 'git remote rename origin o',
      'pnpm install',
      'code .'
    ]
      .filter(Boolean)
      .join(' && ')
  )
}

async function getUserRepositories(): Promise<Repository[]> {
  const username = readLockfile().git
  const { data: repositories } = await axios.get<Repository[]>(
    `https://api.github.com/users/${username}/repos`,
    {
      data: {
        username
      }
    }
  )
  return repositories
}

async function clonePrompt(repositories: Repository[]): Promise<Repository> {
  const sortedRepositories = repositories
    .sort((a, b) => {
      const date = [
        new Date(a.updated_at).getTime(),
        new Date(b.updated_at).getTime()
      ]
      return date[0] > date[1] ? -1 : date[0] < date[1] ? 1 : 0
    })
    .slice(0, 10)

  const response = await p.select({
    message: 'Select one of your repositories:',
    options: sortedRepositories.map(repository => ({
      label: repository.name,
      value: repository
    })),
    initialValue: sortedRepositories[0]
  })
  verifyPromptResponse(response)
  return response
}

export function cloneRecord(app: App): void {
  app.register({
    name: 'clone',
    alias: null,
    params: ['<repository>'],
    description:
      "Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode",
    example: 'my clone my-cli',
    action: cloneCommand
  })
}
