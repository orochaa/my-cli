import { App } from '@/main/app'
import { exec, hasFlag } from '@/utils/cmd'
import { readLockfile } from '@/utils/file-system'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

type Controller = [projectsRoot: string, projects: string[]][]

async function openCommand(params: string[], flags: string[]): Promise<void> {
  const lockfile = readLockfile()
  const controller: Controller = []
  let openProjectList: string[] = []

  for (const projectsRoot of lockfile.projects) {
    const projects = readdirSync(projectsRoot, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(project => project.name)
    controller.push([projectsRoot, projects])
  }

  if (params.length) {
    openProjectList = getParamProjects(params, controller)
  } else {
    openProjectList = await openPrompt(controller)
  }

  const isWorkspace = hasFlag(['-w', '--workspace'], flags)
  if (isWorkspace) {
    exec(`code ${openProjectList.join(' ')}`)
  } else {
    for (const project of openProjectList) {
      exec(`code ${project}`)
    }
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
  const projects = await p.multiselect<PromptOption<string>[], string>({
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
  verifyPromptResponse(projects)

  const isWorkspace = await p.confirm({
    message: 'Open on workspace?',
    initialValue: false
  })
  verifyPromptResponse(isWorkspace)

  return isWorkspace ? [projects.join(' ')] : projects
}

function getPathEnd(path: string): string {
  return path.replace(/.*[/\\](.+)$/i, '$1')
}

export function openRecord(app: App): void {
  app.register({
    name: 'open',
    alias: null,
    params: ['<project>...'],
    flags: ['--workspace', '-w'],
    description:
      'Open a project on vscode, the projects available are based on `setup`',
    example: 'my open my-cli my-app my-api',
    action: openCommand
  })
}

