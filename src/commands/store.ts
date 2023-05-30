import { App } from '@/main/app'
import { isSilent } from '@/utils/cmd'
import { Lockfile, readLockfile, writeLockfile } from '@/utils/file-system'
import {
  convertToJSON,
  mergeObjects,
  objectEntries,
  objectKeys
} from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

async function storeCommand(params: string[]): Promise<void> {
  const lockfile = readLockfile()
  let store: Record<string, unknown> = {}

  if (params.length) {
    store = convertToJSON(params)
  } else {
    store = await storePrompt(lockfile)
  }

  const result: Record<string, unknown> = {}
  mergeObjects(result, lockfile, store)
  pruneData(result)
  writeLockfile(result)

  if (!isSilent()) {
    console.log({ stored: result })
  }
}

async function storePrompt(
  lockfile: Lockfile
): Promise<Record<string, unknown>> {
  const response = await p.group({
    key: () =>
      p.text({
        message: 'What is the key name?',
        placeholder: `Stored keys: ${objectKeys(lockfile).join(' | ')}`
      }),
    value: () =>
      p.text({
        message: 'What is the key value?',
        placeholder: 'remain empty to delete'
      })
  })
  verifyPromptResponse(response)

  return { [response.key]: response.value }
}

function pruneData(data: Record<string, unknown>): void {
  objectEntries(data).forEach(([key, value]) => {
    if (!value) delete data[key]
  })
}

export function storeRecord(app: App): void {
  app.register({
    name: 'store',
    alias: null,
    params: ['<key>=<value>'],
    description: 'Save a key1=value on a local json file',
    example: 'my store key1=foo key2.subset1=bar',
    action: storeCommand
  })
}
