import { LockData, PromptOption } from '@/types'
import { lockfilePath } from '@/utils/constants'
import { mergeObjects, objectEntries } from '@/utils/mappers'
import { hasParams, verifyPromptResponse } from '@/utils/prompt'
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
  const response = await p.select({
    message: 'Select the key you want',
    options: objectEntries(lockfile).map(([label, value]) => ({
      label,
      value
    })),
    initialValue: lockfile[0]
  })

  verifyPromptResponse(response)

  return response
}
