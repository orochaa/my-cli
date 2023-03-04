#!/bin/env node
import * as p from '@clack/prompts'
import { exhaustive } from 'exhaustive'
import { removeCommand } from './commands'
import { Command, PromptOption } from './types'

async function selectCommandPrompt(): Promise<void> {
  console.clear()
  p.intro('⚡ Welcome to my-cli ⚡')
  const option = await p.select<PromptOption<Command>[], Command>({
    message: 'Select a function: ',
    options: [
      {
        label: 'Delete something',
        value: 'remove'
      }
    ],
    initialValue: 'remove'
  })
  await switchCommand(option)
}

async function switchCommand(command: Command | symbol): Promise<void> {
  if (!command || typeof command !== 'string') return

  await exhaustive(command, {
    remove: () => removeCommand(),
    _: () => console.error(`Error: Command ${command} not found 🙁`)
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
