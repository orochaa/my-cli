import { text } from '@clack/prompts'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { remove } from './cmd'
import { switchFunction } from './switch-function'
import { MyFunctionName, MyPrompt, PromptOption } from './types'
import * as p from '@clack/prompts'

export const selectFunctionPrompt: MyPrompt = async () => {
  console.clear()
  p.intro('⚡ Welcome to my-cli ⚡')
  const option = await p.select<PromptOption<MyFunctionName>[], MyFunctionName>(
    {
      message: 'Select a function: ',
      options: [
        {
          label: 'Delete something',
          value: 'remove'
        }
      ],
      initialValue: 'remove'
    }
  )
  await switchFunction(option)
}

export const removePrompt: MyPrompt = async () => {
  const response = await text({
    message: "Type it's name",
    placeholder: 'folder-name | file-name',
    validate: name => {
      if (!existsSync(join(process.cwd(), name))) {
        return `\'${name}\' not found`
      }
    }
  })
  if (typeof response === 'string') {
    await remove(process.cwd(), response)
  }
}
