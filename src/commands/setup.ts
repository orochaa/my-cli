import type { App } from '@/main/app.js'
import {
  readLockfile,
  userGithubPrompt,
  userProjectsRootsPrompt,
  verifyLockfile,
  writeLockfile,
} from '@/utils/lockfile.js'
import type { Lockfile } from '@/utils/lockfile.js'
import { mergeObjects } from '@/utils/mappers.js'
import * as p from '@clack/prompts'

async function setupCommand(): Promise<void> {
  const lockfile: Partial<Lockfile> = verifyLockfile()
    ? readLockfile()
    : ({} satisfies Partial<Lockfile>)

  const setup = await setupPrompt(lockfile)
  const result = mergeObjects(lockfile, setup as Partial<Lockfile>)

  writeLockfile(result)
}

async function setupPrompt(lockfile: Partial<Lockfile>): Promise<Lockfile> {
  const userGithubName = await userGithubPrompt(lockfile.userGithubName)
  const projectsRootList = await userProjectsRootsPrompt(
    lockfile.projectsRootList,
  )
  p.outro('🚀 Setup finished')

  return { userGithubName, projectsRootList }
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
