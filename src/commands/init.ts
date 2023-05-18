import { App } from '@/main/app'
import { exec } from '@/utils/cmd'

async function initCommand() {
  exec('git init')
  exec('git checkout -b master')
  exec('echo node_modules/ > .gitignore')
  exec('pnpm init')
  exec('pnpm add -D typescript @types/node')
  exec('pnpm tsc --init')
  exec('mkdir src')
  exec('cd > src/index.ts')
}

export function initRecord(app: App): void {
  app.register({
    name: 'init',
    alias: null,
    params: null,
    description: 'Initialize a default project with git and typescript',
    action: initCommand
  })
}
