import { App } from '@/main/app'
import * as commands from '@/commands'
import { objectEntries } from '@/utils/mappers'

type CommandKey = keyof typeof commands

type Command = CommandKey extends `${infer TCommand}Record` ? TCommand : never

export function makeSut(command: Command) {
  const sut = new App()
  let isSilent = true

  for (const [key, record] of objectEntries(commands)) {
    if (key.startsWith(command)) {
      record(sut)
      break
    }
  }

  return {
    exec: (...params: string[]): Promise<void> => {
      process.argv = [
        'node',
        'index.[tj]s',
        'command',
        ...params.map(p => p.split(' ')).flat()
      ]

      if (isSilent) {
        process.argv.push('--silent')
      } else {
        isSilent = true
      }

      return sut.exec(command)
    },
    enableLogs: (): void => {
      isSilent = false
    }
  }
}
