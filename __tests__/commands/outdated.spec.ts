import { makeSut } from '@/tests/mocks/make-sut.js'
import { packageName } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import pacote from 'pacote'
import * as p from '@clack/prompts'

const version = {
  current: '0.2.16',
  latest: '0.2.17',
}

const startSpy = jest.fn()
const stopSpy = jest.fn()

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

describe('outdated', () => {
  const sut = makeSut('outdated')

  it('should start spinner', async () => {
    await sut.exec()

    expect(startSpy).toHaveBeenCalledTimes(1)
  })

  it('should check package version', async () => {
    await sut.exec()

    expect(pacote.manifest).toHaveBeenCalledTimes(1)
    expect(pacote.manifest).toHaveBeenCalledWith(packageName, {
      fullMetadata: true,
    })
  })

  it('should print if it is on latest version', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({ version: version.latest })

    await sut.exec()

    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).toHaveBeenCalledWith('🔥 You are up to date')
  })

  it('should print if it is not on latest version', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({ version: version.current })

    await sut.exec()

    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(p.note).toHaveBeenCalledTimes(1)
    expect(p.note).toHaveBeenCalledWith(
      `🚀 Use \`my upgrade\` to update from v${version.current} to v${version.latest}`,
    )
  })

  it('should throw on error', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce(null)
    expect(sut.exec()).rejects.toThrow(
      new NotFoundError(`${packageName}.packageJson`),
    )
  })
})
