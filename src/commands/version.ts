import { type App } from '@/main/app.js'
import { myCliPackageJsonPath } from '@/utils/constants.js'
import { readPackageJson } from '@/utils/file-system.js'
import * as p from '@clack/prompts'

async function versionCommand(): Promise<void> {
  const packageJson = readPackageJson(myCliPackageJsonPath)

  if (packageJson?.version) {
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
    action: versionCommand,
  })
}
