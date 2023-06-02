#!/usr/bin/env node
import { setupApp } from '@/main/setup'
import { Lockfile, readLockfile, verifyLockfile } from '@/utils/file-system'

async function main(): Promise<void> {
  const app = setupApp()

  const lockfile: Partial<Lockfile> = verifyLockfile() ? readLockfile() : {}
  const cmdCommand = process.argv[2]

  try {
    const isNotSetupCommand = cmdCommand !== 'setup'
    const hasNotRanSetup = !(lockfile.git && lockfile.projects)
    if (isNotSetupCommand && hasNotRanSetup) {
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
