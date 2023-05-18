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
  const s = p.spinner()
  let repeat: boolean = false

  let git: string = lockfile.git
  do {
    const response = await p.text({
      message: 'What is your GitHub user name?',
      initialValue: git
    })
    verifyPromptResponse(response)
    git = response

    try {
      s.start('Validating user')
      const { data: user } = await axios.get<GitUser>(
        `https://api.github.com/users/${git}`
      )
      s.stop(`User: ${user.login} | ${user.name}`)
      repeat = false
    } catch {
      s.stop('Invalid user')
      repeat = true
    }
  } while (repeat)

  const projects: string[] = []
  do {
    const response = await p.group({
      projectRoot: () =>
        p.text({
          message: 'What is your root projects path:',
          initialValue: cwd.replace(/(^.*?)[\\/].+/, '$1').concat('/git'),
          validate: res => {
            try {
              readdirSync(res)
            } catch {
              return new NotFoundError('path').message
            }
          }
        }),
      more: () =>
        p.confirm({
          message: 'Add more?',
          initialValue: false
        })
    })
    verifyPromptResponse(response)
    projects.push(response.projectRoot)
    repeat = response.more
  } while (repeat)

  return {
    git,
    projects
  }
}

export function setupRecord(app: App): void {
  app.register({
    name: 'setup',
    alias: null,
    params: null,
    description: 'Prepare the required setup',
    action: setupCommand
  })
}
