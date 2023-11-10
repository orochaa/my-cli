import { App } from '@/main/app.js'
import { cwd } from '@/utils/constants.js'
import { InvalidParamError, NotFoundError } from '@/utils/errors.js'
import {
  type Lockfile,
  readLockfile,
  verifyLockfile,
  writeLockfile,
} from '@/utils/file-system.js'
import { mergeObjects } from '@/utils/mappers.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import { statSync } from 'node:fs'
import axios from 'axios'
import * as p from '@clack/prompts'

async function setupCommand(): Promise<void> {
  const lockfile: Lockfile = verifyLockfile()
    ? readLockfile()
    : ({} as Lockfile)

  const setup = await setupPrompt(lockfile)
  const result = mergeObjects(lockfile, setup)

  writeLockfile(result)
}

async function setupPrompt(lockfile: Lockfile): Promise<Lockfile> {
  const git = await gitPrompt(lockfile.git)
  const projects = await projectsPrompt(lockfile.projects ?? [])
  p.outro('🚀 Setup finished')
  return { git, projects }
}

type GitUser = {
  login: string
  name: string
}

async function gitPrompt(lastGit: string): Promise<string> {
  const spinner = p.spinner()
  let git = !!lastGit ? lastGit : ''
  let repeat = false
  let response
  do {
    response = await p.text({
      message: 'What is your GitHub username?',
      initialValue: git,
    })
    verifyPromptResponse(response)
    git = response

    try {
      spinner.start('Validating user')
      const { data: user } = await axios.get<GitUser>(
        `https://api.github.com/users/${git}`,
      )
      spinner.stop(`User: ${user.login} | ${user.name}`)

      response = await p.confirm({
        message: 'Is that your user?',
        initialValue: true,
      })
      verifyPromptResponse(response)
      repeat = !response
    } catch {
      spinner.stop('Invalid user')
      repeat = true
    }
  } while (repeat)

  return git
}

async function projectsPrompt(lastProjects: string[]): Promise<string[]> {
  const projects: string[] = []
  const defaultProjectRoot = cwd.replace(/^(.*?)[\\/].+/, '$1').concat('/git')

  let repeat: boolean | symbol = true
  let response
  for (let i = 0; repeat; i++) {
    response = await p.text({
      message: 'What is your root projects path:',
      initialValue: lastProjects[i] ?? defaultProjectRoot,
      validate: res => {
        if (!!res) {
          if (projects.includes(res)) {
            return new InvalidParamError(
              'path',
              'this path is already registered',
            ).message
          }
          try {
            const status = statSync(res)
            if (!status.isDirectory()) {
              return new InvalidParamError('path', 'it is not a directory')
                .message
            }
          } catch {
            return new NotFoundError('path').message
          }
        }
      },
    })
    verifyPromptResponse(response)
    projects.push(response)

    response = await p.confirm({
      message: 'Do you want to add another root?',
      initialValue: false,
    })
    verifyPromptResponse(response)
    repeat = response
  }

  return projects.filter(Boolean)
}

export function setupRecord(app: App): void {
  app.register({
    name: 'setup',
    alias: null,
    params: null,
    description: 'Prepare the required setup',
    example: 'my setup',
    action: setupCommand,
  })
}
