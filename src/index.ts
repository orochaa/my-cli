#!/usr/bin/env node
import { setupApp } from '@/main/setup-app.js'
import { Lockfile, readLockfile, verifyLockfile } from '@/utils/file-system.js'

async function main(): Promise<void> {
  const app = setupApp()

  const lockfile: Partial<Lockfile> = verifyLockfile() ? readLockfile() : {}
  const cmdCommand = process.argv[2]

  try {
    const isNotSetupCommand = cmdCommand !== 'setup'
    const hasNotRanSetup = !(lockfile.git && lockfile.projects)
    const isForced = process.argv.includes('--force')

    if (isForced) {
      process.argv = process.argv.filter(param => param !== '--force')
    }

    if (isNotSetupCommand && hasNotRanSetup && !isForced) {
      await app.exec('setup')
    }

    if (cmdCommand) {
      await app.exec(cmdCommand)
    } else {
      app.displayCommands()
    }
  } catch (error) {
    app.errorHandler(error)
  }
}

void main()
