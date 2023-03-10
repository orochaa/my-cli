import {
  Lockfile,
  readLockfile,
  verifyLockfile,
  writeLockfile
} from '@/utils/file-system'
import { mergeObjects } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

export async function setupCommand(): Promise<void> {
  const lockfile: Lockfile = verifyLockfile()
    ? readLockfile()
    : ({} as Lockfile)

  const setup = await setupPrompt()
  const result = mergeObjects(lockfile, setup)

  writeLockfile(result)
}

async function setupPrompt(): Promise<Lockfile> {
  const git = await p.text({
    message: 'Type your GitHub user name:'
  })
  verifyPromptResponse(git)

  const projects: string[] = []
  let more: boolean = false
  do {
    const response = await p.group({
      projectRoot: () =>
        p.text({
          message: 'Type your root projects path:',
          initialValue: 'C:/git'
        }),
      more: () =>
        p.confirm({
          message: 'Add more?',
          initialValue: false
        })
    })
    verifyPromptResponse(response)
    projects.push(response.projectRoot)
    more = response.more
  } while (more)

  return {
    git,
    projects
  }
}
