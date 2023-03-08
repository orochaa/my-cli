import { errorHandler, exec, getParams, hasParams } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import { objectEntries, objectKeys, objectValues } from '@/utils/mappers'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

const players = {
  youtube: {
    aliases: ['y', 'yt', 'youtube'],
    url: 'https://music.youtube.com'
  },
  spotify: {
    aliases: ['s', 'spot', 'spotify'],
    url: 'https://open.spotify.com'
  }
}

export async function playCommand(): Promise<void> {
  let player: string = ''

  if (hasParams()) {
    const alias = getParams()[0]
    for (const data of objectValues(players)) {
      if (data.aliases.includes(alias)) {
        player = data.url
      }
    }
    if (!player) {
      return errorHandler(new InvalidParamError('player'))
    }
  } else {
    player = await playPrompt()
  }

  exec(`start ${player}`)
}

async function playPrompt(): Promise<string> {
  const response = await p.select({
    message: 'Select a player:',
    options: objectEntries(players).map(([player, { url }]) => ({
      label: player,
      value: url
    })),
    initialValue: players.youtube.url
  })
  verifyPromptResponse(response)
  return response
}
