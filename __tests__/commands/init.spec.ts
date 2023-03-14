import { initCommand } from '@/commands'
import cp from 'node:child_process'

describe('initCommand', () => {
  it('should init project by cmd commands', async () => {
    const execSpy = jest.spyOn(cp, 'execSync')
    execSpy.mockImplementation(() => ({} as any))

    await initCommand()

    expect(execSpy).toHaveBeenCalledTimes(8)
  })
})
