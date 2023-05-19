import { errorHandler } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import colors from 'picocolors'

export class App {
  public readonly commands: App.Command[] = []

  public register(command: App.Command): void {
    this.commands.push(command)
  }

  private getCommand(name: string): App.Command | null {
    let command: App.Command | null = null

    for (const _command of this.commands) {
      if (_command.name === name) {
        command = _command
        break
      } else if (_command.alias && _command.alias === name) {
        command = _command
        break
      }
    }

    return command
  }

  public async exec(name: string): Promise<void> {
    const command = this.getCommand(name)
    if (!command) {
      return errorHandler(new InvalidParamError(name))
    }

    const args = process.argv.slice(3)
    const params = args.filter(arg => !/^-/.test(arg))
    const flags = args.filter(arg => /^-/.test(arg))
    await command.action(params, flags)
  }

  private log(msg: string): void {
    process.stdout.write(msg)
  }

  public displayCommands(): void {
    console.clear()

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
      this.log(`  example: ${command.example}\n`)
      this.log('\n')
    }
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
