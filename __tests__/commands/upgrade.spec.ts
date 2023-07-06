import { makeSut } from '@/tests/mocks/make-sut'
import cp from 'node:child_process'
import p from '@clack/prompts'

const startSpy = jest.fn()
const stopSpy = jest.fn()

jest.mock('@clack/prompts', () => ({
  note: jest.fn(async () => ({})),
  outro: jest.fn(async () => ({})),
  spinner: jest.fn(() => ({
    start: startSpy,
    stop: stopSpy
  }))
}))

describe('upgrade', () => {
  const sut = makeSut('upgrade')

  it('should start spinner', async () => {
    const execSpy = jest.spyOn(cp, 'exec')
    execSpy.mockImplementationOnce((cmd, cb) => {
      ;(cb as any)(null, '{}', '')
      return cp as any
    })

    await sut.exec()

    expect(p.spinner).toHaveBeenCalledTimes(1)
    expect(startSpy).toHaveBeenCalledTimes(1)
  })

  it('should check package version', async () => {
    const execSpy = jest.spyOn(cp, 'exec')
    execSpy.mockImplementationOnce((cmd, cb) => {
      ;(cb as any)(null, '{}', '')
      return cp as any
    })

    await sut.exec()

    expect(execSpy).toHaveBeenCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(
      'npm outdated @mist3rbru/my-cli --global --json',
      expect.anything()
    )
  })

  it('should print a message if `outdated` returns null', async () => {
    const execSpy = jest.spyOn(cp, 'exec')
    execSpy.mockImplementationOnce((cmd, cb) => {
      ;(cb as any)(null, 'null', '')
      return cp as any
    })

    await sut.exec()

    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).toHaveBeenCalledWith('🔥 You are up to date')
  })

  it('should print a message if it is on latest version', async () => {
    const execSpy = jest.spyOn(cp, 'exec')
    execSpy.mockImplementationOnce((cmd, cb) => {
      ;(cb as any)(
        null,
        '{"@mist3rbru/my-cli":{"current":"0.0.1","latest":"0.0.1"}}',
        ''
      )
      return cp as any
    })

    await sut.exec()

    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).toHaveBeenCalledWith('🔥 You are up to date')
  })

  it('should upgrade package to latest version', async () => {
    jest.spyOn(cp, 'exec').mockImplementationOnce((cmd, cb) => {
      ;(cb as any)(
        null,
        '{"@mist3rbru/my-cli":{"current":"0.0.1","latest":"0.0.2"}}',
        ''
      )
      return cp as any
    })
    const execSpy = jest.spyOn(cp, 'execSync')
    execSpy.mockImplementation()

    await sut.exec()

    expect(execSpy).toHaveBeenCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(
      'npm install -g @mist3rbru/my-cli@latest',
      expect.anything()
    )
    expect(p.note).toHaveBeenCalledTimes(1)
  })
})
