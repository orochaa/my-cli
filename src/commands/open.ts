import { App } from '@/main/app'
import { exec } from '@/utils/cmd'
import { readLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

async function openCommand(params: string[]): Promise<void> {
  const lockfile = readLockfile()
  const controller: Record<string, string[]> = {}
  let projects: string[] = []

  for (const projectsRoot of lockfile.projects) {
    const projectsFolders = readdirSync(projectsRoot)
    controller[projectsRoot] = projectsFolders
  }

  if (params.length) {
    const controllerEntries = objectEntries(controller)
    for (const [root, folders] of controllerEntries) {
      for (const param of params) {
        if (folders.includes(param)) {
          projects.push(join(root, param))
        }
      }
    }
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

export function openRecord(app: App): void {
  app.register({
    name: 'open',
    alias: null,
    params: ['<project>...'],
    description:
      'Open a project on vscode, the projects available are based on `setup`',
    example: 'my open my-cli my-app my-api',
    action: openCommand
  })
}
