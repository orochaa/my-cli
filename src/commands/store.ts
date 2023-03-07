import { getParams, hasParams } from '@/utils/cmd'
import { storeLockFilePath, tempFolderPath } from '@/utils/constants'
import { mergeObjects, objectEntries, objectKeys } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'

export async function storeCommand(): Promise<void> {
  const store: Record<string, string> = {}
  const result: Record<string, string> = {}
  const lockfile: Record<string, string> = {}

  if (verifyLockfile()) {
    mergeObjects(lockfile, readLockfile())
  }

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

  console.log({ stored: result })
}

async function storePrompt(
  store: Record<string, string>,
  lockfile: Record<string, string>
): Promise<void> {
  const response = await p.group({
    key: () =>
      p.text({
        message: 'Type the key name:',
        placeholder: `Stored keys: ${objectKeys(lockfile).join(' | ')}`
      }),
    value: () =>
      p.text({
        message: 'Type the key value, remain empty to delete'
      })
  })
  verifyPromptResponse(response)
  store[response.key] = response.value
}

function pruneData(data: Record<string, string>): void {
  objectEntries(data).forEach(([key, value]) => {
    if (!value) delete data[key]
  })
}

function verifyLockfile(): boolean {
  return existsSync(storeLockFilePath)
}

function writeLockfile(content: Record<string, string>): void {
  if (!existsSync(tempFolderPath)) mkdirSync(tempFolderPath)
  return writeFileSync(storeLockFilePath, JSON.stringify(content))
}

function readLockfile(): Record<string, string> {
  return JSON.parse(readFileSync(storeLockFilePath).toString())
}
