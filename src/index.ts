#!/usr/bin/env node
import * as command from '@/commands'
import { errorHandler } from '@/utils/cmd'
import { NotFoundError } from '@/utils/errors'
import { Lockfile, readLockfile, verifyLockfile } from '@/utils/file-system'
import { PromptOption } from '@/utils/prompt'
import { exhaustive } from 'exhaustive'
import * as p from '@clack/prompts'

type UnWrapCommand<TCommand extends string> =
  TCommand extends `${infer TName}Command` ? TName : never

type CommandAlias = 'rm'

type Command = UnWrapCommand<keyof typeof command> | CommandAlias

async function selectCommandPrompt(): Promise<void> {
  console.clear()
  p.intro('⚡ Welcome to `(my|your)-cli` ⚡')
  const option = await p.select<PromptOption<Command>[], Command>({
    message: 'Select a command: ',
    options: [
      {
        label: 'Setup config',
        value: 'setup'
      },
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
      },
      {
        label: 'Open project',
        value: 'open'
      },
      {
        label: 'Run scripts',
        value: 'run'
      },
      {
        label: 'Clone repository',
        value: 'clone'
      }
    ]
  })

  await switchCommand(option)
}

async function switchCommand(cmdCommand: Command | symbol): Promise<void> {
  if (!cmdCommand || typeof cmdCommand !== 'string') return

  await exhaustive(cmdCommand, {
    setup: () => command.setupCommand(),
    remove: () => command.removeCommand(),
    rm: () => command.removeCommand(),
    store: () => command.storeCommand(),
    recover: () => command.recoverCommand(),
    password: () => command.passwordCommand(),
    init: () => command.initCommand(),
    api: () => command.apiCommand(),
    open: () => command.openCommand(),
    run: () => command.runCommand(),
    clone: () => command.cloneCommand(),
    _: () => errorHandler(new NotFoundError(cmdCommand))
  })
}

export async function main(): Promise<void> {
  const lockfile: Partial<Lockfile> = verifyLockfile() ? readLockfile() : {}
  const cmdCommand = process.argv[2] as Command

  if (cmdCommand !== 'setup' && !(lockfile.git && lockfile.projects)) {
    await command.setupCommand()
  }

  if (process.argv.length > 2) {
    await switchCommand(cmdCommand)
  } else {
    await selectCommandPrompt()
  }
}

void main()
