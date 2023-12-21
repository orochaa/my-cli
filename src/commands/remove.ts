import { type App } from '@/main/app.js'
import { remove } from '@/utils/cmd.js'
import { cwd } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import { type PromptOption, verifyPromptResponse } from '@/utils/prompt.js'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

async function removeCommand(params: string[]): Promise<void> {
  const removeList = await getRemoveList(params)

  for (const item of removeList) {
    await remove(cwd, item)
    p.outro(`Removed: ${join(cwd, item)}`)
  }
}

async function getRemoveList(params: string[]): Promise<string[]> {
  if (params.length > 0) {
    const error = verifyItems(params)
    if (error) throw error
    return params
  }
  return await removePrompt()
}

async function removePrompt(): Promise<string[]> {
  let paths: string[]

  const isSelectOption = await p.confirm({
    message: 'How do you want to input the paths?',
    active: 'Select',
    inactive: 'Type',
    initialValue: true,
  })
  verifyPromptResponse(isSelectOption)

  if (isSelectOption) {
    const options = readdirSync(cwd)
    const response = await p.multiselect<Array<PromptOption<string>>, string>({
      message: 'What do you want to delete?',
      options: options.map(path => ({
        label: path.replace(/.+[/\\](\w+)/i, '$1'),
        value: path,
      })),
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
      },
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
    description:
      'Remove recursively a folder or file on the relative given path',
    example: 'my rm dist coverage',
    action: removeCommand,
  })
}
