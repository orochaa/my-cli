import * as command from '@/commands'
import { objectValues } from '@/utils/mappers'
import { App } from './app'

export function setupApp(): App {
  const app = new App()

  objectValues(command).map(register => {
    register(app)
  })

  return app
}
