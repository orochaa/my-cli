import { App } from '@/main/app.js'
import { exec, hasFlag } from '@/utils/cmd.js'
import { readLockfile } from '@/utils/file-system.js'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt.js'
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
      .filter(item => item.isDirectory() && !/^\./.test(item.name))
      .map(project => project.name)
    controller.push([projectsRoot, projects])
  }

  if (params.length) {
    openProjectList = getParamProjects(params, controller)
  } else {
    openProjectList = await openPrompt(controller)
  }

  const isReuseWindow = hasFlag(['-r', '--reuse-window'], flags)
  const openFlags = [isReuseWindow && '--reuse-window']

  const isWorkspace =
    hasFlag(['-w', '--workspace'], flags) ||
    (isReuseWindow && openProjectList.length > 1)

  if (isWorkspace) {
    const workspace = openProjectList.join(' ')
    exec(code(workspace, openFlags))
  } else {
    for (const project of openProjectList) {
      exec(code(project, openFlags))
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
          value: join(root, folder),
        }))
      })
      .flat(),
  })
  verifyPromptResponse(projects)

  let isWorkspace: boolean | symbol = false
  if (projects.length > 1) {
    isWorkspace = await p.confirm({
      message: 'Open on workspace?',
      initialValue: false,
    })
    verifyPromptResponse(isWorkspace)
  }

  return isWorkspace ? [projects.join(' ')] : projects
}

function getPathEnd(path: string): string {
  return path.replace(/.*[/\\](.+)$/i, '$1')
}

function code(project: string, flags?: unknown[]): string {
  const _flags = (flags ?? []).filter(Boolean)
  return ['code', project, ..._flags].join(' ')
}

export function openRecord(app: App): void {
  app.register({
    name: 'open',
    alias: null,
    params: ['<project>...'],
    flags: ['--workspace', '-w', '--reuse-window', '-r'],
    description:
      'Open a project on vscode, the projects available are based on `setup`',
    example: 'my open my-cli my-app my-api',
    action: openCommand,
  })
}
