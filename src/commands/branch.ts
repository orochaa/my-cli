import { App } from '@/main/app'
import { exec, execAsync } from '@/utils/cmd'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

async function branchCommand(): Promise<void> {
  const data = await execAsync('git branch -a')
  const branches = data.split('\n').filter(Boolean)

  const response = await p.select({
    message: 'Select a branch:',
    options: branches.map(branch => ({
      label: branch,
      value: branch
    })),
    initialValue: branches.find(branch => /^\*/.test(branch))
  })
  verifyPromptResponse(response)

  if (/^\s*remote/.test(response)) {
    exec(`git checkout -b ${formatRemoteBranch(response)}`)
    exec(
      `git pull ${formatRemoteOrigin(response)} ${formatRemoteBranch(response)}`
    )
  } else {
    exec(`git checkout ${formatBranch(response)}`)
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
