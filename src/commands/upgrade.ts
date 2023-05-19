import { App } from '@/main/app'
import { exec, execAsync } from '@/utils/cmd'
import * as p from '@clack/prompts'

type Outdated = {
  '@mist3rbru/my-cli': {
    current: string
    wanted: string
    latest: string
    dependent: string
    location: string
  }
}

async function outdatedCommand(): Promise<void> {
  const s = p.spinner()
  s.start('Looking for the latest version')
  const version = await getVersion()
  if (version && version.current !== version.latest) {
    s.stop(`my-cli@${version.latest} is out`)
    p.note(
      `🚀 Use \`my upgrade\` to update from v${version.current} to v${version.latest}`
    )
  } else {
    s.stop('🔥 You are up to date')
  }
}

async function upgradeCommand(): Promise<void> {
  const s = p.spinner()
  s.start('Looking for the latest version')
  const version = await getVersion()
  if (version && version.current !== version.latest) {
    s.stop(`Upgrading to v${version.latest}...`)
    exec('npm install -g @mist3rbru/my-cli@latest')
    p.note(`🚀 Upgraded from v${version.current} to v${version.latest}`)
  } else {
    s.stop('🔥 You are up to date')
  }
}

async function getVersion() {
  const res = await execAsync('npm outdated @mist3rbru/my-cli --global --json')
  const json = JSON.parse(res) as Outdated | null
  const version = json?.['@mist3rbru/my-cli']
  return version
}

export function upgradeRecord(app: App): void {
  app.register({
    name: 'upgrade',
    alias: 'up',
    params: null,
    description: 'Update package to latest version',
    action: upgradeCommand
  })
}

  export function outdatedRecord(app: App): void {
  app.register({
    name: 'outdated',
    alias: null,
    params: null,
    description: 'Check if package is on latest version',
    action: outdatedCommand
  })
}
