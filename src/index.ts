#!/usr/bin/env node
import {
  type Command,
  apiCommand,
  initCommand,
  passwordCommand,
  recoverCommand,
  removeCommand,
  storeCommand
} from '@/commands'
import { errorHandler } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { PromptOption } from '@/types'
import { exhaustive } from 'exhaustive'
import * as p from '@clack/prompts'

async function selectCommandPrompt(): Promise<void> {
  console.clear()
  p.intro('⚡ Welcome to `(my|your)-cli` ⚡')
  const option = await p.select<PromptOption<Command>[], Command>({
    message: 'Select a command: ',
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
      },
      {
        label: 'Generate password',
        value: 'password'
      },
      {
        label: 'Init project',
        value: 'init'
      },
      {
        label: 'Create api project',
        value: 'api'
      }
    ]
  })

  await switchCommand(option)
}

async function switchCommand(command: Command | symbol): Promise<void> {
  if (!command || typeof command !== 'string') return

  await exhaustive(command, {
    remove: () => removeCommand(),
    rm: () => removeCommand(),
    store: () => storeCommand(),
    recover: () => recoverCommand(),
    password: () => passwordCommand(),
    init: () => initCommand(),
    api: () => apiCommand(),
    _: () => errorHandler(new NotFoundError(command))
  })
}

export async function main(): Promise<void> {
  if (process.argv.length > 2) {
    await switchCommand(process.argv[2] as Command)
  } else {
    await selectCommandPrompt()
  }
}

void main()
