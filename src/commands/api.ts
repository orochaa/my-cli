import { type App } from '@/main/app.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import { createApi } from '@mist3rbru/create-ts-api'
import * as p from '@clack/prompts'

async function apiCommand(params: string[]): Promise<void> {
  const apiName = params.length ? params[0] : await apiPrompt()

  await createApi(apiName)
}

async function apiPrompt(): Promise<string> {
  const response = await p.text({
    message: 'What is your api name?',
    placeholder: 'my-api',
    validate: res => {
      if (res.length === 0) {
        return 'type a name for your api'
      }
    },
  })
  verifyPromptResponse(response)
  return response
}

export function apiRecord(app: App): void {
  app.register({
    name: 'api',
    alias: null,
    params: ['<name>'],
    description:
      'Create an api with typescript, prettier, eslint and jest with opined configuration',
    example: 'my api ts-api',
    action: apiCommand,
  })
}
