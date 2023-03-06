import { getParams, hasParams, verifyPromptResponse } from '@/utils/prompt'
import { createApi } from '@mist3rbru/create-ts-api'
import * as p from '@clack/prompts'

export async function apiCommand(): Promise<void> {
  let name: string

  if (hasParams()) {
    name = getParams()[0]
  } else {
    name = await apiPrompt()
  }

  await createApi(name)
}

async function apiPrompt(): Promise<string> {
  const response = await p.text({
    message: 'Type your project name:',
    placeholder: 'my-app',
    validate: res => {
      if (res.length === 0) return 'type a name'
    }
  })
  verifyPromptResponse(response)
  return response
}
