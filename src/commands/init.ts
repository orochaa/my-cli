import { exec } from '@/utils/cmd'

export function initCommand() {
  exec('git init')
  exec('git checkout -b master')
  exec('echo node_modules/ dist/ > .gitignore')
  exec('pnpm init')
  exec('pnpm add -D typescript @types/node')
  exec('pnpm tsc --init')
  exec('mkdir src')
  exec('cd > src/index.ts')
}
