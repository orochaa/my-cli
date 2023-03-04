import { selectFunctionPrompt } from './prompts'
import { switchFunction } from './switch-function'
import { MyFunctionName } from './types'

export async function main() {
  if (process.argv.length > 2) {
    await switchFunction(process.argv[2] as MyFunctionName)
  } else {
    await selectFunctionPrompt()
  }
}

main().catch(console.error)
