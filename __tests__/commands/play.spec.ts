import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { InvalidParamError } from '@/utils/errors'
import cp from 'node:child_process'

const players = [
  {
    aliases: ['y', 'yt', 'youtube'],
    url: 'https://music.youtube.com'
  },
  {
    aliases: ['s', 'spot', 'spotify'],
    url: 'https://open.spotify.com'
  }
]

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => players[0].url)
}))

jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as any))

describe('play', () => {
  const sut = makeSut('play')

  beforeEach(() => {
    clearParams()
  })

  it('should open prompt selected player', async () => {
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      `start ${players[0].url}`,
      expect.anything()
    )
  })

  it('should open players by aliases', async () => {
    expect.assertions(players.length * 3)

    for (const { aliases, url } of players) {
      for (const alias of aliases) {
        mockParams(alias)
        await sut.exec()
        expect(cp.execSync).toHaveBeenCalledWith(
          `start ${url}`,
          expect.anything()
        )
      }
    }
  })

  it('should not open invalid players', async () => {
    mockParams('invalid-player')

    expect(sut.exec()).rejects.toThrowError(InvalidParamError)
  })
})
