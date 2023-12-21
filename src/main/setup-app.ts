import * as command from '@/commands/index.js'
import { objectEntries } from '@/utils/mappers.js'
import { App } from './app.js'

export function setupApp(): App {
  const app = new App()

  const sortedCommands = objectEntries(command).sort(([a], [b]) =>
    a === 'setupRecord' ? -1 : a > b ? 1 : a < b ? -1 : 0,
  )
  for (const [, register] of sortedCommands) {
    register(app)
  }

  return app
}
