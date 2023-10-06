import { App } from '@/main/app.js'
import { execOutdated } from '@/utils/cmd.js'
import * as p from '@clack/prompts'

async function outdatedCommand(): Promise<void> {
  const spinner = p.spinner()

  spinner.start('Looking for the latest version')
  const version = await execOutdated()

  if (version && version.current !== version.latest) {
    spinner.stop(`my-cli@${version.latest} is out`)
    p.note(
      `🚀 Use \`my upgrade\` to update from v${version.current} to v${version.latest}`
    )
  } else {
    spinner.stop('🔥 You are up to date')
  }
}

export function outdatedRecord(app: App): void {
  app.register({
    name: 'outdated',
    alias: null,
    params: null,
    description: 'Check if package is on latest version',
    example: 'my outdated',
    action: outdatedCommand
  })
}
