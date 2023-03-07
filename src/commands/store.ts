import { getParams, hasParams } from '@/utils/cmd'
import { lockfilePath, tempPath } from '@/utils/constants'
import { mergeObjects, objectEntries, objectKeys } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import { LockData } from '@/types'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'

export async function storeCommand(): Promise<void> {
  const store: LockData = {}
  const result: LockData = {}
  const lockfile: LockData = {}

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
  pruneLockData(result)
  writeLockfile(result)

  console.log({ stored: result })
}

async function storePrompt(store: LockData, lockfile: LockData): Promise<void> {
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

function pruneLockData(data: LockData): void {
  objectEntries(data).forEach(([key, value]) => {
    if (!value) delete data[key]
  })
}

function verifyLockfile(): boolean {
  return existsSync(lockfilePath)
}

function writeLockfile(content: LockData): void {
  if (!existsSync(tempPath)) mkdirSync(tempPath)
  return writeFileSync(lockfilePath, JSON.stringify(content))
}

function readLockfile(): LockData {
  return JSON.parse(readFileSync(lockfilePath).toString())
}
