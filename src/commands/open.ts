import { App } from '@/main/app'
import { exec } from '@/utils/cmd'
import { readLockfile } from '@/utils/file-system'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

type Controller = [projectsRoot: string, projects: string[]][]

async function openCommand(params: string[]): Promise<void> {
  const lockfile = readLockfile()
  const controller: Controller = []
  let openList: string[] = []

  for (const projectsRoot of lockfile.projects) {
    const projects = readdirSync(projectsRoot, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name)
    controller.push([projectsRoot, projects])
  }

  if (params.length) {
    openList = getParamProjects(params, controller)
  } else {
    openList = await openPrompt(controller)
  }

  for (const project of openList) {
    exec(`code ${project}`)
  }
}

function getParamProjects(params: string[], controller: Controller): string[] {
  const result: string[] = []

  for (const param of params) {
    const paramParts = param.split('/')
    const hasRoot = paramParts.length === 2

    for (const [projectsRoot, projects] of controller) {
      if (hasRoot) {
        const [paramRoot, paramProject] = paramParts
        const rootEnd = getPathEnd(projectsRoot)
        const isRoot = rootEnd === paramRoot
        const hasProject = projects.includes(paramProject)
        if (isRoot && hasProject) {
          result.push(join(projectsRoot, paramProject))
          break
        }
      } else if (projects.includes(param)) {
        result.push(join(projectsRoot, param))
        break
      }
    }
  }

  return result
}

async function openPrompt(controller: Controller): Promise<string[]> {
  const response = await p.multiselect<PromptOption<string>[], string>({
    message: 'Select a project to open:',
    options: controller
      .map(([root, folders]) => {
        const rootEnd = getPathEnd(root)
        return folders.map(folder => ({
          label: `${rootEnd}/${folder}`,
          value: join(root, folder)
        }))
      })
      .flat()
  })
  verifyPromptResponse(response)
  return response
}

function getPathEnd(path: string): string {
  return path.replace(/.+[\/\\](.+)$/i, '$1')
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
