import { NotFoundError, verifyPromptResponse } from '@/utils'
import { errorHandler, remove } from '@/utils/cmd'
import { text } from '@clack/prompts'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export async function removeCommand(): Promise<void> {
  let items: string[] = []

  if (process.argv.length > 3) {
    items = process.argv.slice(3)
    const error = verifyItems(items)
    if (error) errorHandler(error)
  } else {
    items = await removePrompt()
  }

  for (const item of items) {
    await remove(process.cwd(), item)
  }
}

async function removePrompt(): Promise<string[]> {
  const response = await text({
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
