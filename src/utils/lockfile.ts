import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import axios from 'axios'
import * as p from '@clack/prompts'
import { cwd, lockfileDir, lockfilePath } from './constants.js'
import { InvalidParamError, NotFoundError } from './errors.js'
import { verifyPromptResponse } from './prompt.js'

export interface Lockfile {
  userGithubName: string
  projectsRootList: string[]
}

export type LockfileKey = keyof Lockfile

export function verifyLockfile(): boolean {
  return existsSync(lockfilePath)
}

export function readLockfile(): Partial<Lockfile> {
  return JSON.parse(readFileSync(lockfilePath).toString()) as Partial<Lockfile>
}

export function writeLockfile(content: Record<string, unknown>): void {
  if (!existsSync(lockfileDir)) {
    mkdirSync(lockfileDir, { recursive: true })
  }
  writeFileSync(lockfilePath, JSON.stringify(content))
}

async function getLockfilePrompt<TKey extends LockfileKey>(
  key: TKey,
  lockfile: Partial<Lockfile>,
): Promise<Lockfile[TKey]> {
  const lockfilePrompt: {
    [Key in LockfileKey]: (
      lastValue: Lockfile[Key] | undefined,
    ) => Promise<Lockfile[Key]>
  } = {
    projectsRootList: userProjectsRootsPrompt,
    userGithubName: userGithubPrompt,
  }

  return lockfilePrompt[key](lockfile[key])
}

export async function getLockfile<TKey extends LockfileKey>(
  key: TKey,
): Promise<Lockfile[TKey]> {
  const lockfile: Partial<Lockfile> = verifyLockfile() ? readLockfile() : {}

  if (key in lockfile && lockfile[key]) {
    return lockfile[key] as Lockfile[TKey]
  }

  lockfile[key] = await getLockfilePrompt(key, lockfile)
  writeLockfile(lockfile)

  return lockfile[key] as Lockfile[TKey]
}

interface GitUser {
  login: string
  name: string
}

export async function userGithubPrompt(lastGit?: string): Promise<string> {
  const spinner = p.spinner()
  let git = lastGit
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

export async function userProjectsRootsPrompt(
  lastProjects?: string[],
): Promise<string[]> {
  const projects: string[] = []
  const defaultProjectRoot = `${cwd.replace(/^(.*?)[/\\].+/, '$1')}/git`

  let repeat: boolean | symbol = true
  let response

  for (let i = 0; repeat; i++) {
    response = await p.text({
      message: 'What is your root projects path:',
      initialValue: lastProjects?.[i] ?? defaultProjectRoot,
      validate: res => {
        if (res) {
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
