import { exhaustive } from 'exhaustive'
import { removePrompt } from './prompts'
import { MyFunctionName } from './types'

export async function switchFunction(
  funcName: MyFunctionName | symbol
): Promise<void> {
  if (!funcName || typeof funcName !== 'string') return

  await exhaustive(funcName, {
    remove: () => removePrompt()
  })
}
