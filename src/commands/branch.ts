import { type App } from '@/main/app.js'
import { exec, execAsync } from '@/utils/cmd.js'
import { maxItems } from '@/utils/constants.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import * as p from '@clack/prompts'

async function branchCommand(): Promise<void> {
  const branchesData = await execAsync('git branch -a')
  const branches = branchesData.split('\n').filter(Boolean)

  const selectedBranch = await branchPrompt(branches)

  if (isRemoteBranch(selectedBranch)) {
    const remoteBranch = formatRemoteBranch(selectedBranch)
    const remoteOrigin = formatRemoteOrigin(selectedBranch)
    exec(`git checkout -b ${remoteBranch}`)
    exec(`git pull ${remoteOrigin} ${remoteBranch}`)
  } else {
    const originsData = await execAsync('git remote')
    const originsList = originsData.split(/\n/g)
    const origin =
      originsList.find(origin => origin.startsWith('o')) ?? originsList[0]
    const branch = formatBranch(selectedBranch)
    exec(`git checkout ${branch}`)
    exec(`git pull ${origin} ${branch}`)
  }
}

function isRemoteBranch(branch: string): boolean {
  return /^\s*remote/.test(branch)
}

function formatBranch(branch: string): string {
  return branch.replace(/.*?(\S+)$/, '$1')
}

function formatRemoteBranch(branch: string): string {
  return branch.replace(/^\s*(?:\w+\/){2}(?:HEAD.+?\/)?(.+)/, '$1')
}

function formatRemoteOrigin(origin: string): string {
  return origin.replace(/^\s*\w+\/(\w+).+/, '$1')
}

async function branchPrompt(branches: string[]): Promise<string> {
  const response = await p.select({
    message: 'Select a branch:',
    options: branches.map(branch => ({
      label: branch,
      value: branch,
    })),
    initialValue: branches.find(branch => /^\*/.test(branch)),
    maxItems,
  })
  verifyPromptResponse(response)
  return response
}

export function branchRecord(app: App): void {
  app.register({
    name: 'branch',
    alias: 'b',
    params: null,
    description:
      'List all local and remote branches, to select and checkout to it',
    example: 'my b',
    action: branchCommand,
  })
}
