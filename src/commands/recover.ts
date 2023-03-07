import { errorHandler, hasParams } from '@/utils/cmd'
import { storeLockFilePath } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { mergeObjects, objectEntries } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import { existsSync, readFileSync } from 'node:fs'
import * as p from '@clack/prompts'

export async function recoverCommand(): Promise<void> {
  const lockfile: Record<string, string> = {}
  let value: string

  if (verifyLockfile()) {
    mergeObjects(lockfile, readLockfile())
  }

  if (hasParams()) {
    const key = process.argv[3]
    value = lockfile[key]
  } else {
    value = await recoverPrompt(lockfile)
  }

  p.outro(String(value))
}

function verifyLockfile(): boolean {
  return existsSync(storeLockFilePath)
}

function readLockfile(): Record<string, string> {
  return JSON.parse(readFileSync(storeLockFilePath).toString())
}

async function recoverPrompt(
  lockfile: Record<string, string>
): Promise<string> {
  const lockEntries = objectEntries(lockfile)
  if (!lockEntries.length) {
    errorHandler(new NotFoundError('stored data'))
  }
  const response = await p.select({
    message: 'Select the key you want:',
    options: lockEntries.map(([label, value]) => ({
      label,
      value
    })),
    initialValue: lockfile[0]
  })

  verifyPromptResponse(response)

  return response
}
