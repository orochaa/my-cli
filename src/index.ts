#!/usr/bin/env node
import { setupApp } from '@/main/setup'
import { Lockfile, readLockfile, verifyLockfile } from '@/utils/file-system'

async function main(): Promise<void> {
  const app = setupApp()

  const lockfile: Partial<Lockfile> = verifyLockfile() ? readLockfile() : {}
  const cmdCommand = process.argv[2]

  try {
    if (cmdCommand !== 'setup' && !(lockfile.git && lockfile.projects)) {
      await app.exec('setup')
    }

    if (process.argv.length > 2) {
      await app.exec(cmdCommand)
    } else {
      app.displayCommands()
    }
  } catch (error) {
    app.errorHandler(error)
  }
}

void main()
