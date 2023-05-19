import { setupApp } from '@/main/setup'
import * as commands from '@/commands'

describe('setup', () => {
  it('should register all commands', async () => {
    const sut = setupApp()

    expect(sut.commands).toHaveLength(Object.keys(commands).length)
  })
})
