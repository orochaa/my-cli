import { errorHandler, exec, getParams, hasParams } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { readLockfile } from '@/utils/file-system'
import { verifyPromptResponse } from '@/utils/prompt'
import axios from 'axios'
import * as p from '@clack/prompts'

type Repository = {
  name: string
  clone_url: string
  updated_at: string
}

export async function cloneCommand(): Promise<void> {
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

  if (hasParams()) {
    const params = getParams()
    const foundRepo = repositories.find(repo => repo.name === params[0])
    if (!foundRepo) {
      return errorHandler(new NotFoundError(params[0]))
    }
    repo = foundRepo
  } else {
    repo = await clonePrompt(
      repositories
        .sort((a, b) =>
          new Date(a.updated_at).getTime() > new Date(b.updated_at).getTime()
            ? -1
            : 1
        )
        .slice(0, 10)
    )
  }

  exec(`git clone ${repo.clone_url} ${repo.name}`)
  exec(`cd ${repo.name} && git remote rename origin o`)
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
