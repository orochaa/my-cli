import { isSilent } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import colors from 'picocolors'

export class App {
  public readonly commands: App.Command[] = []

  public register(command: App.Command): void {
    this.commands.push(command)
  }

  public async exec(name: string): Promise<void> {
    const command = this.getCommand(name)
    if (!command) {
      return this.errorHandler(new InvalidParamError(name))
    }

    const args = process.argv.slice(3)
    const params: string[] = []
    const flags: string[] = []
    for (const arg of args) {
      if (arg.startsWith('-')) {
        flags.push(arg)
      } else {
        params.push(arg)
      }
    }

    return command.action(params, flags)
  }

  public displayCommands(): void {
    this.log('# List of Commands\n')
    for (const command of this.commands) {
      this.log(`${colors.magenta('-')} command: ${colors.cyan(command.name)}\n`)
      if (command.alias) {
        this.log(`  alias: ${command.alias}\n`)
      }
      if (command.params?.length) {
        const params = command.params
          .map(p => colors.magenta(`'${p}'`))
          .join(' | ')
        this.log(`  params: ${params}\n`)
      }
      if (command.flags?.length) {
        const flags = command.flags
          .map(p => colors.magenta(`'${p}'`))
          .join(' | ')
        this.log(`  flags: ${flags}\n`)
      }
      this.log(`  description: ${command.description}\n`)
      this.log(`  example: ${command.example}\n\n`)
    }
  }

  public errorHandler(error: Error): never {
    if (!isSilent()) {
      this.log(`${error.name}: ${error.message}\n`)
    }
    process.exit(0)
  }

  private log(msg: string): void {
    process.stdout.write(msg)
  }

  private getCommand(name: string): App.Command | null {
    for (const command of this.commands) {
      if (command.name === name || (command.alias && command.alias === name)) {
        return command
      }
    }
    return null
  }
}

export namespace App {
  export type Action = (params: string[], flags: string[]) => Promise<void>

  export interface Command {
    name: string
    alias: string | null
    params: string[] | null
    flags?: string[]
    description: string
    example: `my ${string}`
    action: Action
  }
}
