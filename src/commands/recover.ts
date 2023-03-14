import { errorHandler, hasParams } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { Lockfile, readLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

export async function recoverCommand(): Promise<void> {
  const lockfile = readLockfile()
  let value: string | string[]

  if (hasParams()) {
    const key = process.argv[3]
    value = lockfile[key]
  } else {
    value = await recoverPrompt(lockfile)
  }

  if (!value || typeof value === 'string') {
    p.outro(String(value))
  } else {
    value.forEach(v => {
      p.outro(String(v))
    })
  }
}

async function recoverPrompt(lockfile: Lockfile): Promise<string | string[]> {
  const lockEntries = objectEntries(lockfile)
  if (!lockEntries.length) {
    errorHandler(new NotFoundError('stored data'))
  }
  const response = await p.select({
    message: 'Select the key you want to recover:',
    options: lockEntries.map(([label, value]) => ({
      label,
      value: value as string
    })),
    initialValue: lockfile.git
  })

  verifyPromptResponse(response)

  return response
}
