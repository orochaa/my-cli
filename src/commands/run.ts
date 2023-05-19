import { App } from '@/main/app'
import { errorHandler, exec } from '@/utils/cmd'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { PackageJson, getPackageJson } from '@/utils/file-system'
import { objectKeys } from '@/utils/mappers'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

async function runCommand(scripts: string[], flags: string[]): Promise<void> {
  const hasScripts = scripts.length
  const isDeep = flags.includes('--deep') || flags.includes('-D')

  if (hasScripts && isDeep) {
    deepRun(scripts)
  } else if (hasScripts) {
    shallowRun(scripts)
  } else {
    await promptRun()
  }
}

function run(scripts: string[]): void {
  for (const script of scripts) {
    exec(`npm run ${script}`)
  }
}

function shallowRun(scripts: string[]): void {
  const packageJson = getPackageJson()
  if (!packageJson?.scripts) {
    return errorHandler(new NotFoundError('packageJson.scripts'))
  }
  for (const script of scripts) {
    if (!packageJson.scripts[script]) {
      return errorHandler(new NotFoundError(script))
    }
  }
  run(scripts)
}

function deepRun(scripts: string[]): void {
  const localFolders = readdirSync(cwd).filter(d => !/\./.test(d))
  for (const folder of localFolders) {
    const packageJson = getPackageJson(join(cwd, folder, 'package.json'))
    if (packageJson?.scripts) {
      process.chdir(join(cwd, folder))
      run(verifyScripts(scripts, packageJson))
    }
  }
}

async function promptRun(): Promise<void> {
  const packageJson = getPackageJson()
  if (!packageJson?.scripts) {
    return errorHandler(new NotFoundError('packageJson.scripts'))
  }
  run(await runPrompt(packageJson))
}

function verifyScripts(scripts: string[], packageJson: PackageJson): string[] {
  const result: string[] = []
  for (const script of scripts) {
    if (packageJson?.scripts?.[script]) {
      result.push(script)
    }
  }
  return result
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

export function runRecord(app: App): void {
  app.register({
    name: 'run',
    alias: null,
    params: ['<script>...'],
    flags: ['--deep', '-D'],
    description: "Run scripts from project's package.json in sequence",
    example: 'my run lint build test',
    action: runCommand
  })
}
