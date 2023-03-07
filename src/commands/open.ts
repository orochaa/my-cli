import { errorHandler, exec, getParams, hasParams } from '@/utils/cmd'
import { projectsFolderPath } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

export async function openCommand(): Promise<void> {
  const projects = readdirSync(projectsFolderPath)
  let project: string

  if (hasParams()) {
    project = getParams()[0]
    if (!projects.includes(project)) {
      return errorHandler(new NotFoundError(project))
    }
  } else {
    project = await openPrompt(projects)
  }

  exec(`code ${join(projectsFolderPath, project)}`)
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
