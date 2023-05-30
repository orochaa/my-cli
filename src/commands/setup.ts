import { App } from '@/main/app'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import {
  Lockfile,
  readLockfile,
  verifyLockfile,
  writeLockfile
} from '@/utils/file-system'
import { mergeObjects } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
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

type GitUser = {
  login: string
  name: string
}

async function setupPrompt(lockfile: Lockfile): Promise<Lockfile> {
  const git = await gitPrompt(lockfile)
  const projects = await projectsPrompt(lockfile)
  return { git, projects }
}

async function gitPrompt(lockfile: Lockfile): Promise<string> {
  const spinner = p.spinner()
  let repeat: boolean = false
  let git: string = lockfile.git

  do {
    const response = await p.text({
      message: 'What is your GitHub username?',
      initialValue: git
    })
    verifyPromptResponse(response)
    git = response

    try {
      spinner.start('Validating user')
      const { data: user } = await axios.get<GitUser>(
        `https://api.github.com/users/${git}`
      )
      spinner.stop(`User: ${user.login} | ${user.name}`)
      repeat = false
    } catch {
      spinner.stop('Invalid user')
      repeat = true
    }
  } while (repeat)

  return git
}

async function projectsPrompt(lockfile: Lockfile): Promise<string[]> {
  const projects: string[] = []
  let repeat: boolean | symbol = false

  do {
    const projectRoot = await p.text({
      message: 'What is your root projects path:',
      initialValue: cwd.replace(/(^.*?)[\\/].+/, '$1').concat('/git'),
      validate: res => {
        try {
          readdirSync(res)
        } catch {
          return new NotFoundError('path').message
        }
      }
    })
    verifyPromptResponse(projectRoot)
    projects.push(projectRoot)

    repeat = await p.confirm({
      message: 'Do you want to add other root?',
      initialValue: false
    })
    verifyPromptResponse(repeat)
  } while (repeat)

  return projects
}

export function setupRecord(app: App): void {
  app.register({
    name: 'setup',
    alias: null,
    params: null,
    description: 'Prepare the required setup',
    example: 'my setup',
    action: setupCommand
  })
}
