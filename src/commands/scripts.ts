import { type App } from '@/main/app.js'
import { MissingParamError, NotFoundError } from '@/utils/errors.js'
import { readPackageJson, writePackageJson } from '@/utils/file-system.js'
import { objectEntries, objectKeys } from '@/utils/mappers.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import * as p from '@clack/prompts'

type ScriptGroup = 'prisma' | 'jest' | 'vitest' | 'lint' | 'changeset'

const scripts: Record<ScriptGroup, Record<string, string>> = {
  lint: {
    lint: 'run-s lint:tsc lint:prettier lint:eslint',
    'lint:tsc': 'tsc --noEmit',
    'lint:prettier': 'prettier --write .',
    'lint:eslint': 'eslint --fix "src/**/*.ts" "__tests__/**/*.ts"',
  },
  jest: {
    test: 'jest --no-cache',
    'test:ci': 'jest --no-cache  --coverage --silent',
  },
  vitest: {
    test: 'vitest --run',
    'test:ci': 'vitest --run --coverage --silent',
  },
  prisma: {
    postinstall: 'npm run prisma',
    prisma: 'prisma generate',
    'prisma:dev': 'prisma migrate dev',
    'prisma:prod': 'prisma migrate deploy',
    'prisma:reset': 'prisma migrate reset',
  },
  changeset: {
    ci: 'run-s lint build test',
    publish: 'changeset publish',
    release: 'run-s ci publish',
  },
}

const scriptKeys = objectKeys(scripts)

async function scriptsCommand(
  params: string[],
  flags: string[],
): Promise<void> {
  const scriptGroups =
    params.length > 0
      ? (params.filter(param => scriptKeys.includes(param)) as ScriptGroup[])
      : await scriptsPrompt()

  if (scriptGroups.length === 0) {
    throw new MissingParamError('scripts')
  }

  const packageJson = readPackageJson()

  if (!packageJson) {
    throw new NotFoundError('package.json')
  }

  packageJson.scripts ??= {}

  for (const scriptGroup of scriptGroups) {
    for (const [scriptName, scriptCommand] of objectEntries(
      scripts[scriptGroup],
    )) {
      packageJson.scripts[scriptName] = scriptCommand
    }
  }

  writePackageJson(packageJson)
}

async function scriptsPrompt(): Promise<ScriptGroup[]> {
  const response = await p.multiselect({
    message: 'Select as many scripts as you want:',
    options: scriptKeys.map(script => ({
      label: script,
      value: script,
    })),
    required: true,
    initialValues: [] as ScriptGroup[],
  })
  verifyPromptResponse(response)

  return response
}

export function scriptsRecord(app: App): void {
  app.register({
    name: 'scripts',
    alias: null,
    params: scriptKeys,
    flags: undefined,
    description: 'Write common scripts on local package.json',
    example: 'my scripts',
    action: scriptsCommand,
  })
}
