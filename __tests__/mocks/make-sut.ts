import { App } from '@/main/app.js'
import * as commands from '@/commands/index.js'
import { objectEntries } from '@/utils/mappers.js'

type CommandKey = keyof typeof commands

type Command = CommandKey extends `${infer TCommand}Record` ? TCommand : never

export function makeSut(command: Command) {
  const sut = new App()
  for (const [key, record] of objectEntries(commands)) {
    if (key.startsWith(command)) {
      record(sut)
      break
    }
  }

  const setParams = (params: string[]): void => {
    process.argv = ['node', 'index.[tj]s', 'command', ...params]
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
    exec: (...params: string[]): Promise<void> => {
      setParams(params.map(p => p.split(' ')).flat())
      setSilent()
      return sut.exec(command)
    },
    execRaw: (...params: string[]): Promise<void> => {
      setParams(params)
      setSilent()
      return sut.exec(command)
    },
    enableLogs: (): void => {
      isSilent = false
    }
  }
}
