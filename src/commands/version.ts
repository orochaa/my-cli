import { type App } from '@/main/app.js'
import * as p from '@clack/prompts'
import { version } from '../../package.json'

// eslint-disable-next-line @typescript-eslint/require-await
async function versionCommand(): Promise<void> {
  p.outro(`v${version}`)
}

export function versionRecord(app: App): void {
  app.register({
    name: 'version',
    alias: null,
    params: null,
    description: 'Display current package version',
    example: 'my version',
    action: versionCommand,
  })
}
