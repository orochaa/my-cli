import { App } from '@/main/app'
import { errorHandler, remove } from '@/utils/cmd'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

async function removeCommand(params: string[]): Promise<void> {
  let items: string[] = []

  if (params.length) {
    items = params
    const error = verifyItems(items)
    if (error) return errorHandler(error)
  } else {
    items = await removePrompt()
  }

  for (const item of items) {
    await remove(cwd, item)
    p.outro(`Removed: ${join(cwd, item)}`)
  }
}

async function removePrompt(): Promise<string[]> {
  let paths: string[]

  const isSelectOption = await p.confirm({
    message: 'How do you want to input the paths?',
    active: 'Select',
    inactive: 'Type',
    initialValue: true
  })
  verifyPromptResponse(isSelectOption)

  if (isSelectOption) {
    const options = readdirSync(cwd)
    const response = await p.multiselect<PromptOption<string>[], string>({
      message: 'What do you want to delete?',
      options: options.map(path => ({
        label: path.replace(/.+[\\/](\w+)/i, '$1'),
        value: path
      }))
    })
    verifyPromptResponse(response)
    paths = response
  } else {
    const response = await p.text({
      message: 'What do you want to delete?',
      placeholder: 'folder-name file-name...',
      validate: res => {
        const error = verifyItems(res.split(' '))
        if (error) return error.message
      }
    })
    verifyPromptResponse(response)
    paths = response.split(' ')
  }
  return paths
}

function verifyItems(items: string[]): Error | null {
  for (const item of items) {
    if (!existsSync(join(cwd, item))) {
      return new NotFoundError(item)
    }
  }
  return null
}

export function removeRecord(app: App): void {
  app.register({
    name: 'remove',
    alias: 'rm',
    params: ['<folder | file>...'],
    description: 'Remove recursively a folder or file on the relative given path',
    action: removeCommand
  })
}
