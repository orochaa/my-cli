#!/usr/bin/env node
import { setupApp } from '@/main/setup-app.js'
import { readLockfile, verifyLockfile } from '@/utils/file-system.js'
import type { Lockfile } from '@/utils/file-system.js'

async function main(): Promise<void> {
  const app = setupApp()

  const lockfile: Partial<Lockfile> = verifyLockfile() ? readLockfile() : {}
  const cmdCommand = process.argv[2]

  try {
    const isNotSetupCommand = cmdCommand !== 'setup'
    const hasNotRanSetup = !(lockfile.git && lockfile.projects)
    const isForced = process.argv.includes('--force')
    const isHelp = process.argv.includes('--help')

    if (isHelp || !cmdCommand) {
      const command = app.getCommand(cmdCommand)
      command ? app.displayCommand(command) : app.displayAllCommands()
    } else {
      if (isForced) {
        process.argv = process.argv.filter(param => param !== '--force')
      }

      if (isNotSetupCommand && hasNotRanSetup && !isForced) {
        await app.exec('setup')
      }

      await app.exec(cmdCommand)
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.handleError(error)
  }
}

void main()
