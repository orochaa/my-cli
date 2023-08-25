import { App } from '@/main/app.js'
import { exec, hasFlag } from '@/utils/cmd.js'
import { cwd } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import { PackageJson, getPackageJson } from '@/utils/file-system.js'
import { objectKeys } from '@/utils/mappers.js'
import { PromptOption, verifyPromptResponse } from '@/utils/prompt.js'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

type Runner = 'npm' | 'npx'

async function runCommand(scripts: string[], flags: string[]): Promise<void> {
  const hasScripts = !!scripts.length
  const isDeep = hasFlag(['--deep', '-d'], flags)

  if (hasScripts && isDeep) {
    deepRun(scripts)
  } else if (hasScripts) {
    shallowRun(scripts)
  } else {
    await runPrompt()
  }
}

function shallowRun(scripts: string[]): void {
  const packageJson = getPackageJson()
  verifyScripts(packageJson)
  run(filterScripts(scripts, packageJson))
}

function deepRun(scripts: string[]): void {
  const localFolders = readdirSync(cwd, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const folder of localFolders) {
    const packageJson = getPackageJson(join(cwd, folder, 'package.json'))
    if (packageJson?.scripts) {
      process.chdir(join(cwd, folder))
      run(filterScripts(scripts, packageJson))
    }
  }
}

async function runPrompt(): Promise<void> {
  const packageJson = getPackageJson()
  verifyScripts(packageJson)

  const scripts = await p.multiselect<PromptOption<string>[], string>({
    message: 'Select some scripts to run in sequence: ',
    options: objectKeys(packageJson.scripts).map(script => ({
      label: script,
      value: script
    })),
    required: true
  })
  verifyPromptResponse(scripts)

  run(mapScripts(scripts, packageJson))
}

function run(data: [string, Runner][]): void {
  for (const [script, runner] of data) {
    runner === 'npm'
      ? exec(`npm run ${script}`, { log: false })
      : exec(`npx ${script}\n`, { log: true })
  }
}

function verifyScripts(
  packageJson: PackageJson | null
): asserts packageJson is { scripts: Record<string, string> } {
  if (!packageJson) {
    throw new NotFoundError('package.json')
  } else if (!packageJson.scripts) {
    throw new NotFoundError('packageJson.scripts')
  }
}

function mapScripts(
  scripts: string[],
  packageJson: PackageJson
): [string, Runner][] {
  return scripts.map(script => {
    const isNpm = !!packageJson?.scripts?.[script]
    return isNpm ? [script, 'npm'] : [script, 'npx']
  })
}

function filterScripts(
  scripts: string[],
  packageJson: PackageJson
): [string, Runner][] {
  const isPartial = hasFlag(['--partial', '-p'])
  const mappedScripts = mapScripts(scripts, packageJson)

  return isPartial
    ? mappedScripts.filter(([_, runner]) => runner === 'npm')
    : mappedScripts
}

export function runRecord(app: App): void {
  app.register({
    name: 'run',
    alias: null,
    params: ['<script>...'],
    flags: ['--deep', '-d', '--partial', '-p'],
    description: 'Run scripts in sequence',
    example: 'my run lint build "vitest --run"',
    action: runCommand
  })
}
