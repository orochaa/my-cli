import { isSilent } from '@/utils/cmd.js'
import { InvalidParamError } from '@/utils/errors.js'
import colors from 'picocolors'

export class App {
  public readonly commands: App.Command[] = []

  public register(command: App.Command): void {
    this.commands.push(command)
  }

  public async exec(name: string): Promise<void> {
    const command = this.getCommand(name)
    if (!command) {
      return this.handleError(new InvalidParamError(name))
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

    await command.action(params, flags)
  }

  public getCommand(name: string): App.Command | null {
    for (const command of this.commands) {
      if (command.name === name || (command.alias && command.alias === name)) {
        return command
      }
    }
    return null
  }

  public displayCommand(command: App.Command): void {
    this.log(`${colors.magenta('-')} command: ${colors.cyan(command.name)}\n`)
    if (command.alias) {
      this.log(`  alias: ${command.alias}\n`)
    }
    if (command.params?.length) {
      this.log(`  params: ${this.mapHighlight(command.params)}\n`)
    }
    if (command.flags?.length) {
      this.log(`  flags: ${this.mapHighlight(command.flags)}\n`)
    }
    this.log(`  description: ${command.description}\n`)
    this.log(`  example: ${command.example}\n\n`)
  }

  public displayAllCommands(): void {
    this.log('# List of Commands\n')
    for (const command of this.commands) {
      this.displayCommand(command)
    }
  }

  public handleError(error: Error): never {
    if (!isSilent()) {
      this.log(`${error.name}: ${error.message}\n`)
    }
    process.exit(0)
  }

  private log(msg: string): void {
    process.stdout.write(msg)
  }

  private mapHighlight(items: string[]): string {
    return items.map(item => colors.magenta(`\`${item}\``)).join(' | ')
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
