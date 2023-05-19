import { App } from '@/main/app'
import * as commands from '@/commands'
import { objectEntries } from '@/utils/mappers'

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
  return {
    exec: () => sut.exec(command)
  }
}
