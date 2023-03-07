import { errorHandler, exec, getParams, hasParams } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { readLockfile } from '@/utils/file-system'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

export async function openCommand(): Promise<void> {
  const lockfile = readLockfile()
  const projects = readdirSync(lockfile.projects)
  let project: string

  if (hasParams()) {
    project = getParams()[0]
    if (!projects.includes(project)) {
      return errorHandler(new NotFoundError(project))
    }
  } else {
    project = await openPrompt(projects)
  }

  exec(`code ${join(lockfile.projects, project)}`)
}

async function openPrompt(projects: string[]): Promise<string> {
  const response = await p.select<PromptOption<string>[], string>({
    message: 'Select a project to open:',
    options: projects.map(project => ({
      label: project,
      value: project
    }))
  })
  verifyPromptResponse(response)
  return response
}
