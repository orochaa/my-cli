import { App } from '@/main/app.js'
import * as commands from '@/commands/index.js'
import { objectEntries } from '@/utils/mappers.js'

type CommandKey = keyof typeof commands

type Command = CommandKey extends `${infer TCommand}Record` ? TCommand : never

interface Sut {
  exec(...params: string[]): Promise<void>
  execRaw(...params: string[]): Promise<void>
  enableLogs(): void
}

const setParams = (params: string[]): void => {
  process.argv = ['node', 'index.[tj]s', 'command', ...params]
}

export function makeSut(command: Command): Sut {
  const sut = new App()
  for (const [key, record] of objectEntries(commands)) {
    if (key.startsWith(command)) {
      record(sut)
      break
    }
  }

  let isSilent = true
  const setSilent = (): void => {
    if (isSilent) {
      process.argv.push('--silent')
    } else {
      isSilent = true
    }
  }

  return {
    exec: async (...params: string[]): Promise<void> => {
      setParams(params.flatMap(p => p.split(' ')))
      setSilent()
      await sut.exec(command)
    },
    execRaw: async (...params: string[]): Promise<void> => {
      setParams(params)
      setSilent()
      await sut.exec(command)
    },
    enableLogs: (): void => {
      isSilent = false
    },
  }
}
