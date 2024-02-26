import { setupApp } from '@/main/setup-app.js'
import * as commands from '@/commands/index.js'

describe('setup', () => {
  it('should register all commands', () => {
    const sut = setupApp()

    expect(sut.commands).toHaveLength(Object.keys(commands).length)
  })

  it('should not have duplicate command name', () => {
    const sut = setupApp()

    const nameList = sut.commands.map(c => c.name)
    const noDuplicateNameList = [...new Set(nameList)]

    expect(nameList).toHaveLength(noDuplicateNameList.length)
  })

  it('should not have duplicate command alias', () => {
    const sut = setupApp()

    const aliasList = sut.commands.map(c => c.alias).filter(Boolean)
    const noDuplicateAliasList = [...new Set(aliasList)]

    expect(aliasList).toHaveLength(noDuplicateAliasList.length)
  })

  it('should not have --force flag', () => {
    const sut = setupApp()

    const flagsList = sut.commands
      .map(c => c.flags)
      .filter(Boolean)
      .flat()

    expect(flagsList).not.toContain('--force')
  })
})
