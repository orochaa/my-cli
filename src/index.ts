#!/bin/env node
import * as p from '@clack/prompts'
import { exhaustive } from 'exhaustive'
import { recoverCommand, removeCommand, storeCommand } from './commands'
import { Command, PromptOption } from './types'

async function selectCommandPrompt(): Promise<void> {
  console.clear()
  p.intro('⚡ Welcome to my-cli ⚡')
  const option = await p.select<PromptOption<Command>[], Command>({
    message: 'Select a function: ',
    options: [
      {
        label: 'Delete item',
        value: 'remove'
      },
      {
        label: 'Store value',
        value: 'store'
      },
      {
        label: 'Recover value',
        value: 'recover'
      }
    ]
  })

  await switchCommand(option)
}

async function switchCommand(command: Command | symbol): Promise<void> {
  if (!command || typeof command !== 'string') return

  await exhaustive(command, {
    remove: () => removeCommand(),
    store: () => storeCommand(),
    recover: () => recoverCommand(),
    _: async () => console.error(`Error: Command ${command} not found 🙁`)
  })
}

export async function main(): Promise<void> {
  if (process.argv.length > 2) {
    await switchCommand(process.argv[2] as Command)
  } else {
    await selectCommandPrompt()
  }
}

main().catch(console.error)
