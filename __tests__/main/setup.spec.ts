import { setupApp } from '@/main/setup'
import * as commands from '@/commands'

describe('setup', () => {
  it('should register all commands', async () => {
    const sut = setupApp()

    expect(sut.commands).toHaveLength(Object.keys(commands).length)
  })

  it('should not have duplicate commands', async () => {
    const sut = setupApp()

    const expected = [...new Set(sut.commands.map(_command => _command.name))]

    expect(sut.commands).toHaveLength(expected.length)
  })

  it('should not have duplicate commands', async () => {
    const sut = setupApp()

    const nameList = sut.commands.map(c => c.name)
    const noDuplicateNameList = [...new Set(nameList)]

    expect(nameList.length).toBe(noDuplicateNameList.length)
  })

  it('should not have duplicate command alias', async () => {
    const sut = setupApp()

    const aliasList = sut.commands.map(c => c.alias).filter(Boolean)
    const noDuplicateAliasList = [...new Set(aliasList)]

    expect(aliasList.length).toBe(noDuplicateAliasList.length)
  })
})
