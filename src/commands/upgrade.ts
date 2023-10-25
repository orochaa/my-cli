import { App } from '@/main/app.js'
import { exec, execOutdated } from '@/utils/cmd.js'
import * as p from '@clack/prompts'

async function upgradeCommand(): Promise<void> {
  const spinner = p.spinner()

  spinner.start('Looking for the latest version')
  const version = await execOutdated()

  if (version && version.current !== version.latest) {
    spinner.stop(`Upgrading to v${version.latest}...`)
    exec('npm install -g @mist3rbru/my-cli@latest', {
      stdio: 'ignore',
      log: false,
    })
    p.note(`🚀 Upgraded from v${version.current} to v${version.latest}`)
  } else {
    spinner.stop('🔥 You are up to date')
  }
}

export function upgradeRecord(app: App): void {
  app.register({
    name: 'upgrade',
    alias: 'up',
    params: null,
    description: 'Update package to latest version',
    example: 'my up',
    action: upgradeCommand,
  })
}
