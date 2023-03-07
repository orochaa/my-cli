import {
  LockfileKey,
  readLockfile,
  verifyLockfile,
  writeLockfile
} from '@/utils/file-system'
import { mergeObjects } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

export async function setupCommand(): Promise<void> {
  const lockfile: Record<string, string> = {}
  if (verifyLockfile()) {
    mergeObjects(lockfile, readLockfile())
  }

  const setup = await setupPrompt()
  const result = mergeObjects(lockfile, setup)

  writeLockfile(result)
}

async function setupPrompt(): Promise<Record<LockfileKey, string>> {
  const response = await p.group({
    git: () =>
      p.text({
        message: 'Type your GitHub user name:'
      }),
    projects: () =>
      p.text({
        message: 'Type your root projects path:',
        initialValue: 'C:/git'
      })
  })
  verifyPromptResponse(response)
  return response
}
