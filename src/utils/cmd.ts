import { execSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

export function errorHandler(error: Error): never {
  process.stdout.write(`${error.name}: `)
  process.stdout.write(error.message)
  process.stdout.write('\n')
  process.exit(0)
}

export async function remove(folder: string, item: string): Promise<void> {
  await rm(join(folder, item), { recursive: true })
}

export function exec(cmd: string): void {
  execSync(cmd, { stdio: 'inherit' })
}

export function hasParams(): boolean {
  return process.argv.length > 3
}

export function getParams(): string[] {
  return process.argv.slice(3)
}
