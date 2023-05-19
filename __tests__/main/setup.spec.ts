import { setupApp } from '@/main/setup'
import * as commands from '@/commands'

describe('setup', () => {
  it('should register all commands', async () => {
    const sut = setupApp()

    expect(sut.commands).toHaveLength(Object.keys(commands).length)
  })

  it('should not have duplicate commands', async () => {
    const sut = setupApp()

    const expected = sut.commands.filter((command, _, arr) => {
      return arr.map(_command => _command.name).includes(command.name)
    })

    expect(sut.commands).toHaveLength(expected.length)
  })
})
