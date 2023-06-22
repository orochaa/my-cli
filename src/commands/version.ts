import { App } from '@/main/app'
import { root } from '@/utils/constants'
import { getPackageJson } from '@/utils/file-system'
import { join } from 'path'
import * as p from '@clack/prompts'

async function versionCommand(): Promise<void> {
  const packageJson = getPackageJson(join(root, 'package.json'))
  if (!!packageJson?.version) {
    p.outro(`v${packageJson.version}`)
  } else {
    p.outro('🙁 Could not find package')
  }
}

export function versionRecord(app: App): void {
  app.register({
    name: 'version',
    alias: null,
    params: null,
    description: 'Display current package version',
    example: 'my version',
    action: versionCommand
  })
}
