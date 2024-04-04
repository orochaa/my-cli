import type { App } from '@/main/app.js'
import { exec, hasFlag } from '@/utils/cmd.js'
import { cwd } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import { readPackageJson } from '@/utils/file-system.js'
import type { PackageJson } from '@/utils/file-system.js'
import { objectEntries } from '@/utils/mappers.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import type { PromptOption } from '@/utils/prompt.js'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { detect } from '@antfu/ni'
import * as p from '@clack/prompts'

type Runner = 'npm' | 'npx'

async function runCommand(scripts: string[], flags: string[]): Promise<void> {
  const hasScripts = scripts.length > 0
  const isDeep = hasFlag(['--deep', '-d'], flags)

  if (hasScripts && isDeep) {
    await deepRun(scripts)
  } else if (hasScripts) {
    await shallowRun(scripts)
  } else {
    await runPrompt()
  }
}

async function shallowRun(scripts: string[]): Promise<void> {
  const packageJson = readPackageJson()
  verifyScripts(packageJson)
  await run(filterScripts(scripts, packageJson))
}

async function run(data: [Runner, string][]): Promise<void> {
  const pm = (await detect()) ?? 'pnpm'

  for (const [runner, script] of data) {
    const command =
      script === 'install' ? pm : runner === 'npm' ? 'npm run' : runner
    exec(`${command} ${script}`)
  }
}

async function deepRun(scripts: string[]): Promise<void> {
  const localFolders = readdirSync(cwd, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const folder of localFolders) {
    const packageJson = readPackageJson(path.join(cwd, folder, 'package.json'))

    if (packageJson?.scripts) {
      process.chdir(path.join(cwd, folder))
      await run(filterScripts(scripts, packageJson))
    }
  }
}

function verifyScripts(
  packageJson: PackageJson | null,
): asserts packageJson is PackageJson & { scripts: Record<string, string> } {
  if (!packageJson) {
    throw new NotFoundError('package.json')
  } else if (!packageJson.scripts) {
    throw new NotFoundError('packageJson.scripts')
  }
}

function filterScripts(
  scripts: string[],
  packageJson: PackageJson,
): [Runner, string][] {
  const isPartial = hasFlag(['--partial', '-p'])
  const mappedScripts = mapScriptsRunner(scripts, packageJson)

  return isPartial
    ? mappedScripts.filter(([runner]) => runner === 'npm')
    : mappedScripts
}

function mapScriptsRunner(
  scripts: string[],
  packageJson: PackageJson,
): [Runner, string][] {
  return scripts.map(script => {
    const isNpm = !!packageJson.scripts?.[script]

    return [isNpm ? 'npm' : 'npx', script]
  })
}

async function runPrompt(): Promise<void> {
  const packageJson = readPackageJson()
  verifyScripts(packageJson)

  const scripts = await p.multiselect<PromptOption<string>[], string>({
    message: 'Select some scripts to run in sequence: ',
    options: objectEntries(packageJson.scripts).map(([script, cmd]) => ({
      label: script,
      value: script,
      hint: cmd,
    })),
    required: true,
  })
  verifyPromptResponse(scripts)

  const runList = mapScriptsRunner(scripts, packageJson)
  p.outro(`my run ${runList.map(([_, s]) => s).join(' ')}`)
  await run(runList)
}

export function runRecord(app: App): void {
  app.register({
    name: 'run',
    alias: null,
    params: ['<...scripts>'],
    flags: ['--deep', '-d', '--partial', '-p'],
    description: 'Run scripts in sequence',
    example: 'my run lint build "vitest --run"',
    action: runCommand,
  })
}
