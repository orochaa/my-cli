import { App } from '@/main/app'
import { errorHandler, exec } from '@/utils/cmd'
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
  const username = readLockfile().git
  let repo: Repository

  const { data: repositories } = await axios.get<Repository[]>(
    `https://api.github.com/users/${username}/repos`,
    {
      data: {
        username
      }
    }
  )

  if (params.length) {
    const foundRepo = repositories.find(repo => repo.name === params[0])
    if (!foundRepo) {
      return errorHandler(new NotFoundError(params[0]))
    }
    repo = foundRepo
  } else {
    repo = await clonePrompt(
      repositories
        .sort((a, b) => {
          const date = [
            new Date(a.updated_at).getTime(),
            new Date(b.updated_at).getTime()
          ]
          return date[0] > date[1] ? -1 : date[0] < date[1] ? 1 : 0
        })
        .slice(0, 10)
    )
  }

  const isNotCloned = !existsSync(join(cwd, repo.name))
  exec(
    [
      isNotCloned && `git clone ${repo.clone_url} ${repo.name}`,
      `cd ${repo.name}`,
      isNotCloned && 'git remote rename origin o',
      'pnpm install',
      'code .'
    ]
      .filter(Boolean)
      .join(' && ')
  )
}

async function clonePrompt(repositories: Repository[]): Promise<Repository> {
  const response = await p.select({
    message: 'Select one of your repositories:',
    options: repositories.map(d => ({
      label: d.name,
      value: d
    })),
    initialValue: repositories[0]
  })
  verifyPromptResponse(response)
  return response
}

export function cloneRecord(app: App): void {
  app.register({
    name: 'clone',
    alias: null,
    params: ['<repository>'],
    description: 'Clone a Github\'s repository based on `setup`',
    action: cloneCommand
  })
}
