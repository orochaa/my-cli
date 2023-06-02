import { App } from '@/main/app'
import { NotFoundError } from '@/utils/errors'
import { Lockfile, readLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

async function recoverCommand(params: string[]): Promise<void> {
  const lockfile = readLockfile()
  let values: string[] = []

  if (params.length) {
    for (const param of params) {
      const key = param
      values.push(String(lockfile[key]))
    }
  } else {
    values = await recoverPrompt(lockfile)
  }

  for (const value of values) {
    p.outro(value)
  }
}

async function recoverPrompt(lockfile: Lockfile): Promise<string[]> {
  const lockEntries = objectEntries(lockfile)
  if (!lockEntries.length) {
    throw new NotFoundError('stored data')
  }
  const response = (await p.multiselect({
    message: 'Select the key you want to recover:',
    options: lockEntries.map(([label, value]) => ({
      label,
      value: String(value)
    })),
    required: true
  })) as symbol | string[]
  verifyPromptResponse(response)
  return response
}

export function recoverRecord(app: App): void {
  app.register({
    name: 'recover',
    alias: null,
    params: ['<key>...'],
    description: 'Return the value of a saved key',
    example: 'my recover git projects',
    action: recoverCommand
  })
}
