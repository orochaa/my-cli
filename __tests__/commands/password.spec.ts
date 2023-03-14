import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { passwordCommand } from '@/commands'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => '20'),
  outro: jest.fn()
}))

describe('passwordCommand', () => {
  beforeEach(() => {
    clearParams()
  })

  it('should generate a password with prompt length', async () => {
    await passwordCommand()

    expect((p.outro as jest.Mock).mock.calls[0][0]).toHaveLength(20)
  })

  it('should generate a password with params length', async () => {
    mockParams(['15'])

    await passwordCommand()

    expect((p.outro as jest.Mock).mock.calls[0][0]).toHaveLength(15)
  })

  it('should verify password length', async () => {
    expect.assertions(3)
    const edges = ['7', '101', 'NaN']
    const exitSpy = jest.spyOn(global.process, 'exit')
    exitSpy.mockImplementation(() => ({} as never))

    for (const edge of edges) {
      exitSpy.mockClear()
      mockParams([edge])
      await passwordCommand()
      expect(exitSpy).toHaveBeenCalledTimes(1)
    }
  })
})
