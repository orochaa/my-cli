import { exec, getParams, hasParams } from '@/utils/cmd'
import { readLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

export async function openCommand(): Promise<void> {
  const lockfile = readLockfile()
  const controller: Record<string, string[]> = {}
  let projects: string[] = []

  for (const path of lockfile.projects) {
    controller[path] = readdirSync(path)
  }

  if (hasParams()) {
    const params = getParams()
    const controllerEntries = objectEntries(controller)
    controllerEntries.forEach(([root, folders]) => {
      params.forEach(param => {
        if (folders.includes(param)) {
          projects.push(join(root, param))
        }
      })
    })
  } else {
    projects = await openPrompt(controller)
  }

  projects.forEach(project => {
    exec(`code ${project}`)
  })
}

async function openPrompt(
  controller: Record<string, string[]>
): Promise<string[]> {
  const response = await p.multiselect<PromptOption<string>[], string>({
    message: 'Select a project to open:',
    options: objectEntries(controller)
      .map(([root, folders]) => {
        const rootEnd = root.replace(/.+[\\/](\w+)/i, '$1')
        return folders
          .filter(folder => !/\.\w+$/.test(folder))
          .map(folder => ({
            label: `${rootEnd}/${folder}`,
            value: join(root, folder)
          }))
      })
      .flat()
  })
  verifyPromptResponse(response)
  return response
}
