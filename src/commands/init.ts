import { App } from '@/main/app.js'
import { exec } from '@/utils/cmd.js'

async function initCommand() {
  exec('git init')
  exec('git checkout -b master')
  exec('echo node_modules/ > .gitignore')
  exec('pnpm init')
  exec('pnpm add -D typescript @types/node tsx prettier')
  exec('pnpm tsc --init')
  exec('echo {} > .prettierrc.json')
  exec('echo "node_modules/\n\npnpm-lock.yaml" > .prettierignore')
  exec('mkdir src')
  exec('cd > src/index.ts')
}

export function initRecord(app: App): void {
  app.register({
    name: 'init',
    alias: null,
    params: null,
    description: 'Initialize a default project with git and typescript',
    example: 'my init',
    action: initCommand,
  })
}
