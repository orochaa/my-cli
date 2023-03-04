import { errorHandler, remove } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { hasParams, getParams, verifyPromptResponse } from '@/utils/prompt'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

export async function removeCommand(): Promise<void> {
  let items: string[] = []

  if (hasParams()) {
    items = getParams()
    const error = verifyItems(items)
    if (error) errorHandler(error)
  } else {
    items = await removePrompt()
  }

  for (const item of items) {
    await remove(process.cwd(), item)
    p.outro(`Removed: ${join(process.cwd(), item)}`)
  }
}

async function removePrompt(): Promise<string[]> {
  const response = await p.text({
    message: "Type it's names",
    placeholder: 'folder-name file-name...',
    validate: res => {
      const error = verifyItems(res.split(' '))
      if (error) return error.message
    }
  })

  verifyPromptResponse(response)
  return response.split(' ')
}

function verifyItems(items: string[]): Error | null {
  for (const item of items) {
    if (!existsSync(join(process.cwd(), item))) {
      return new NotFoundError(item)
    }
  }
  return null
}
