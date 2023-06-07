import { App } from '@/main/app'
import { exec } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import { objectEntries, objectValues } from '@/utils/mappers'
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

async function playCommand(params: string[]): Promise<void> {
  let player: string = ''

  if (params.length) {
    const alias = params[0]
    for (const playerData of objectValues(players)) {
      if (playerData.aliases.includes(alias)) {
        player = playerData.url
        break
      }
    }
    if (!player) {
      throw new InvalidParamError('player')
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

export function playRecord(app: App): void {
  app.register({
    name: 'play',
    alias: null,
    params: objectValues(players).map((player) => player.aliases).flat(),
    description: 'Open a music player on your default browser',
    example: 'my play yt',
    action: playCommand
  })
}
