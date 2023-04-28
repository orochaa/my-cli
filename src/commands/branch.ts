import { exec, execAsync } from '@/utils/cmd'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

export async function branchCommand(): Promise<void> {
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

  if (/^remote/.test(response)) {
    exec(`git checkout -b ${formatRemoteBranch(response)}`)
    exec(
      `git pull ${formatRemoteOrigin(response)} ${formatRemoteBranch(response)}`
    )
  } else {
    exec(`git checkout ${formatBranch(response)}`)
  }
}

function formatBranch(response: string): string {
  return response.replace(/.+?([^\s]+)$/, '$1')
}

function formatRemoteBranch(response: string): string {
  return response.replace(/^\w+\/\w+\/(.+)/, '$1')
}

function formatRemoteOrigin(response: string): string {
  return response.replace(/^\w+\/(\w+).+/, '$1')
}
