#!/usr/bin/env node
import { setupApp } from '@/main/setup-app.js'

async function main(): Promise<void> {
  const app = setupApp()
  const cmdCommand = process.argv[2]

  try {
    const isHelp = process.argv.includes('--help')

    if (isHelp || !cmdCommand) {
      const command = app.getCommand(cmdCommand)
      command ? app.displayCommand(command) : app.displayAllCommands()
    } else {
      await app.exec(cmdCommand)
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.handleError(error)
  }
}

void main()
