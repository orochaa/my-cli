import { setupApp } from '@/main/setup'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

function run(): void {
  const readmePath = join(cwd(), 'README.md')
  if (!existsSync(readmePath)) {
    throw new Error('README file not found')
  }

  const readmeContent = readFileSync(readmePath).toString().split(/\r?\n/g)
  const commandsIndex = readmeContent.findIndex(line =>
    /^[#\s]+commands/i.test(line)
  )
  if (commandsIndex === -1) {
    throw new Error('Commands section not found')
  }

  const newReadmeContent = readmeContent.slice(0, commandsIndex + 2)
  const app = setupApp()

  for (const command of app.commands) {
    newReadmeContent.push(`- \`${command.name}\`: ${command.description}`)
    if (command.alias)
      newReadmeContent.push(`  - alias: ${highlight(command.alias)}`)

    if (command.params)
      newReadmeContent.push(`  - params: ${highlight(command.params)}`)

    if (command.flags)
      newReadmeContent.push(`  - flags: ${highlight(command.flags)}`)

    newReadmeContent.push(`  - example: ${command.example}`)
  }
  newReadmeContent.push('')

  writeFileSync(readmePath, newReadmeContent.join('\r\n'), { encoding: 'utf8' })
}

function highlight(text: string | string[]): string {
  if (typeof text === 'string') {
    text = [text]
  }
  return text.map(t => `\`${t}\``).join(' | ')
}

run()
