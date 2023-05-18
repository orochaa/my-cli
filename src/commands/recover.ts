import { App } from '@/main/app'
import { errorHandler } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { Lockfile, readLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

async function recoverCommand(params: string[]): Promise<void> {
  const lockfile = readLockfile()
  let value: string | string[]

  if (params.length) {
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

export function recoverRecord(app: App): void {
  app.register({
    name: 'recover',
    alias: null,
    params: ['<key>'],
    description: 'Return the value of a saved key',
    action: recoverCommand
  })
}
