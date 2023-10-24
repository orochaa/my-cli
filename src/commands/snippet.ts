import { App } from '@/main/app.js'
import { hasFlag } from '@/utils/cmd.js'
import { cwd, root } from '@/utils/constants.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as p from '@clack/prompts'

const _snippetsFolder = resolve(root, 'public/snippets')
const _vscodeFolder = resolve(cwd, '.vscode')
const _extension = '.code-snippets'
const _snippets = readdirSync(_snippetsFolder).map(file =>
  file.replace(_extension, '')
)

async function snippetCommand(
  params: string[],
  flags: string[]
): Promise<void> {
  let snippets: string[]

  if (hasFlag('--create', flags)) {
    createVsCodeFolder()
    createProjectSnippet()
    return
  }

  snippets = params.length
    ? params.filter(param => _snippets.includes(param))
    : await snippetPrompt()

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
  writeFileSync(dest, '{}\n')
  log(dest)
}

function copySnippet(snippet: string): void {
  const fileName = snippet + _extension
  const src = resolve(_snippetsFolder, fileName)
  const dest = resolve(_vscodeFolder, fileName)
  copyFileSync(src, dest)
  log(dest)
}

async function snippetPrompt(): Promise<string[]> {
  const response = (await p.multiselect({
    message: 'Pick your snippets:',
    options: _snippets.map(snippet => ({ value: snippet })),
    required: true
  })) as string[] | symbol
  verifyPromptResponse(response)
  return response
}

export function snippetRecord(app: App): void {
  app.register({
    name: 'snippet',
    alias: null,
    params: _snippets.sort(),
    flags: ['--create'],
    description: 'Create snippet collections on local project',
    example: 'my snippet nest nest-test',
    action: snippetCommand
  })
}
