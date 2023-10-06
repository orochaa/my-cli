import * as command from '@/commands/index.js'
import { objectEntries } from '@/utils/mappers.js'
import { App } from './app.js'

export function setupApp(): App {
  const app = new App()

  objectEntries(command)
    .sort(([a], [b]) => (a === 'setupRecord' ? -1 : a > b ? 1 : a < b ? -1 : 0))
    .forEach(([_, register]) => {
      register(app)
    })

  return app
}
