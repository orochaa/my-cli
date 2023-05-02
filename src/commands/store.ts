import { getParams, hasParams, isSilent } from '@/utils/cmd'
import { Lockfile, readLockfile, writeLockfile } from '@/utils/file-system'
import { mergeObjects, objectEntries, objectKeys } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

export async function storeCommand(): Promise<void> {
  const lockfile = readLockfile()
  const store: Record<string, unknown> = {}
  const result: Record<string, unknown> = {}

  if (hasParams()) {
    const params = getParams()
    params.forEach(param => {
      const [key, value] = param.split('=')
      store[key] = value
    })
  } else {
    await storePrompt(store, lockfile)
  }

  mergeObjects(result, lockfile, store)
  pruneData(result)
  writeLockfile(result)

  if (!isSilent()) {
    console.log({ stored: result })
  }
}

async function storePrompt(
  store: Record<string, unknown>,
  lockfile: Lockfile
): Promise<void> {
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
  store[response.key] = response.value
}

function pruneData(data: Record<string, unknown>): void {
  objectEntries(data).forEach(([key, value]) => {
    if (!value) delete data[key]
  })
}
