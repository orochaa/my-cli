import { makeSut } from '@/tests/mocks/make-sut.js'
import { packageName } from '@/utils/constants.js'
import cp from 'node:child_process'
import pacote from 'pacote'
import * as p from '@clack/prompts'

const startSpy = jest.fn()
const stopSpy = jest.fn()

const version = {
  current: '0.2.16',
  latest: '0.2.17',
}

jest.mock('@clack/prompts', () => ({
  note: jest.fn(),
  outro: jest.fn(),
  spinner: jest.fn(() => ({
    start: startSpy,
    stop: stopSpy,
  })),
}))

jest.mock('pacote', () => ({
  manifest: jest.fn(async () => ({
    version: version.latest,
  })),
}))

jest.spyOn(cp, 'execSync').mockImplementation()

describe('upgrade', () => {
  const sut = makeSut('upgrade')

  it('should start spinner', async () => {
    await sut.exec()

    expect(p.spinner).toHaveBeenCalledTimes(1)
    expect(startSpy).toHaveBeenCalledTimes(1)
  })

  it('should check package version', async () => {
    await sut.exec()

    expect(pacote.manifest).toHaveBeenCalledTimes(1)
    expect(pacote.manifest).toHaveBeenCalledWith(packageName, {
      fullMetadata: true,
    })
  })

  it('should print a message if it is on latest version', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({ version: version.latest })

    await sut.exec()

    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).toHaveBeenCalledWith('🔥 You are up to date')
  })

  it('should print a message if it is not on latest version', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({ version: version.current })

    await sut.exec()

    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).toHaveBeenCalledWith(`Upgrading to v${version.latest}...`)
    expect(p.note).toHaveBeenCalledWith(
      `🚀 Upgraded from v${version.current} to v${version.latest}`,
    )
  })

  it('should upgrade package to latest version', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({ version: version.current })
    const execSpy = jest.spyOn(cp, 'execSync').mockImplementation()

    await sut.exec()

    expect(execSpy).toHaveBeenCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(
      'npm install -g @mist3rbru/my-cli@latest',
      expect.anything(),
    )
  })
})
