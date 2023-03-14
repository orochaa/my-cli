import { errorHandler, exec, getParams, hasParams } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { PackageJson, getPackageJson } from '@/utils/file-system'
import { objectKeys } from '@/utils/mappers'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

export async function runCommand(): Promise<void> {
  let scripts: string[]

  const packageJson = getPackageJson()
  if (!packageJson?.scripts) {
    return errorHandler(new NotFoundError('scripts'))
  }

  if (hasParams()) {
    scripts = getParams()
    const error = verifyScripts(scripts, packageJson)
    if (error) return errorHandler(error)
  } else {
    scripts = await runPrompt(packageJson)
  }

  for (const script of scripts) {
    exec(`npm run ${script}`)
  }
}

function verifyScripts(
  scripts: string[],
  packageJson: PackageJson
): Error | null {
  for (const script of scripts) {
    if (!packageJson.scripts[script]) {
      return new NotFoundError(`${script} script`)
    }
  }
  return null
}

async function runPrompt(packageJson: PackageJson): Promise<string[]> {
  const response = await p.multiselect<PromptOption<string>[], string>({
    message: 'Select some scripts to run in sequence: ',
    options: objectKeys(packageJson.scripts).map(script => ({
      label: script,
      value: script
    })),
    required: true
  })
  verifyPromptResponse(response)
  return response
}
