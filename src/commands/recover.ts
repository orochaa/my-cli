import { errorHandler } from '@/utils/cmd'
import { lockfilePath } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { mergeObjects, objectEntries } from '@/utils/mappers'
import { hasParams, verifyPromptResponse } from '@/utils/prompt'
import { LockData } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import * as p from '@clack/prompts'

export async function recoverCommand(): Promise<void> {
  const lockfile: LockData = {}
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
  return existsSync(lockfilePath)
}

function readLockfile(): LockData {
  return JSON.parse(readFileSync(lockfilePath).toString())
}

async function recoverPrompt(lockfile: LockData): Promise<string> {
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
