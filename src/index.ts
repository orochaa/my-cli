#!/usr/bin/env node
import * as command from '@/commands'
import { errorHandler } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import { Lockfile, readLockfile, verifyLockfile } from '@/utils/file-system'
import { PromptOption } from '@/utils/prompt'
import * as p from '@clack/prompts'

type CommandKey = keyof typeof command

type CommandAlias = 'rm'

type Command<TCommandKey extends CommandKey = CommandKey> =
  TCommandKey extends `${infer TCommand}Command` ? TCommand : never

async function selectCommandPrompt(): Promise<void> {
  console.clear()
  p.intro('⚡ Welcome to `my-cli` ⚡')
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
      },
      {
        label: 'Play music',
        value: 'play'
      }
    ]
  })

  await switchCommand(option)
}

async function switchCommand(
  cmdCommand: Command | CommandAlias | symbol
): Promise<void> {
  if (!cmdCommand || typeof cmdCommand !== 'string') return

  const commandKey = `${cmdCommand}Command` as CommandKey
  const commandAliases: { [K in CommandAlias]: CommandKey } = {
    rm: 'removeCommand'
  }

  if (commandKey in command) {
    await command[commandKey]()
  } else if (cmdCommand in commandAliases) {
    await command[commandAliases[cmdCommand as CommandAlias]]()
  } else {
    errorHandler(new InvalidParamError(cmdCommand))
  }
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
