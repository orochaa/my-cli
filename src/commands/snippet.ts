import { type App } from '@/main/app.js'
import { hasFlag } from '@/utils/cmd.js'
import { cwd, root } from '@/utils/constants.js'
import { type PromptOption, verifyPromptResponse } from '@/utils/prompt.js'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import * as p from '@clack/prompts'

const _snippetsFolder = resolve(root, 'public/snippets')
const _vscodeFolder = resolve(cwd, '.vscode')
const _extension = '.code-snippets'

async function snippetCommand(
  params: string[],
  flags: string[],
): Promise<void> {
  if (hasFlag('--create', flags)) {
    createVsCodeFolder()
    createProjectSnippet()
    return
  }

  const snippetOptions = mapSnippets()
  const snippets =
    params.length > 0
      ? params.filter(param => snippetOptions.includes(param))
      : await snippetPrompt(snippetOptions)

  createVsCodeFolder()
  for (const snippet of snippets) {
    copySnippet(snippet)
  }
}

function log(dest: string): void {
  p.log.success(`Snippet created: ${dest}`)
}

function createVsCodeFolder(): void {
  if (!existsSync(_vscodeFolder)) {
    mkdirSync(_vscodeFolder)
  }
}

function createProjectSnippet(): void {
  const projectName = cwd.replace(/^.+\/(.+)/, '$1')
  const fileName = projectName + _extension
  const dest = resolve(_vscodeFolder, fileName)
  if (existsSync(dest)) {
    p.log.warn(`Project's snippet already exists: ${dest}`)
  } else {
    writeFileSync(dest, '{}\n')
    log(dest)
  }
}

function copySnippet(snippet: string): void {
  const fileName = snippet + _extension
  const src = resolve(_snippetsFolder, fileName)
  const dest = resolve(_vscodeFolder, fileName)
  copyFileSync(src, dest)
  log(dest)
}

function mapSnippets(): string[] {
  return readdirSync(_snippetsFolder).map(file => file.replace(_extension, ''))
}

async function snippetPrompt(snippetOptions: string[]): Promise<string[]> {
  const response = await p.multiselect<Array<PromptOption<string>>, string>({
    message: 'Pick your snippets:',
    options: snippetOptions.map(snippet => ({ value: snippet })),
    required: true,
  })
  verifyPromptResponse(response)
  return response
}

export function snippetRecord(app: App): void {
  app.register({
    name: 'snippet',
    alias: null,
    params: mapSnippets().sort(),
    flags: ['--create'],
    description: 'Create snippet collections on local project',
    example: 'my snippet nest nest-test',
    action: snippetCommand,
  })
}
