import { App } from '@/main/app'
import { exec, execAsync } from '@/utils/cmd'
import { verifyPromptResponse } from '@/utils/prompt'
import p from '@clack/prompts'

async function branchCommand(): Promise<void> {
  const branchesData = await execAsync('git branch -a')
  const branches = branchesData.split('\n').filter(Boolean)

  const selectedBranch = await branchPrompt(branches)

  const isRemote = /^\s*remote/.test(selectedBranch)
  if (isRemote) {
    const remoteBrach = formatRemoteBranch(selectedBranch)
    const remoteOrigin = formatRemoteOrigin(selectedBranch)
    exec(`git checkout -b ${remoteBrach}`)
    exec(`git pull ${remoteOrigin} ${remoteBrach}`)
  } else {
    const branch = formatBranch(selectedBranch)
    exec(`git checkout ${branch}`)
  }
}

function formatBranch(response: string): string {
  return response.replace(/.*?([^\s]+)$/, '$1')
}

function formatRemoteBranch(response: string): string {
  return response.replace(/^\s*\w+\/\w+\/(HEAD.+?\/)?(.+)/, '$2')
}

function formatRemoteOrigin(response: string): string {
  return response.replace(/^\s*\w+\/(\w+).+/, '$1')
}

async function branchPrompt(branches: string[]): Promise<string> {
  const response = await p.select({
    message: 'Select a branch:',
    options: branches.map(branch => ({
      label: branch,
      value: branch
    })),
    initialValue: branches.find(branch => /^\*/.test(branch)),
    maxItems: 8
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
    action: branchCommand
  })
}
