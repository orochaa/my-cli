import { errorHandler, hasParams } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { readLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

export async function recoverCommand(): Promise<void> {
  const lockfile = readLockfile()
  let value: string

  if (hasParams()) {
    const key = process.argv[3]
    value = lockfile[key]
  } else {
    value = await recoverPrompt(lockfile)
  }

  p.outro(String(value))
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
