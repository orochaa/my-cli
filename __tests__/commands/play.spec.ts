import { makeSut } from '@/tests/mocks/make-sut.js'
import { InvalidParamError } from '@/utils/errors.js'
import { objectValues } from '@/utils/mappers.js'
import open from 'open'

const players = {
  youtube: {
    aliases: ['y', 'yt', 'youtube'],
    url: 'https://music.youtube.com',
  },
  spotify: {
    aliases: ['s', 'spot', 'spotify'],
    url: 'https://open.spotify.com',
  },
}

jest.mock('@clack/prompts', () => ({
  select: jest.fn(async () => players.youtube.url),
  outro: jest.fn(),
}))

jest.mock('open', () => jest.fn())

describe('play', () => {
  const sut = makeSut('play')

  it('should open players by aliases', async () => {
    for (const { aliases, url: player } of objectValues(players)) {
      for (const alias of aliases) {
        await sut.exec(alias)
        expect(open).toHaveBeenCalledWith(player)
        ;(open as jest.Mock).mockReset()
      }
    }
  })

  it('should not open invalid players', async () => {
    const promise = sut.exec('invalid-player')
    expect(promise).rejects.toThrow(InvalidParamError)
  })

  it('should open prompt selected player', async () => {
    await sut.exec()

    expect(open).toHaveBeenCalledWith(players.youtube.url)
  })
})
