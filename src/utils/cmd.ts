import { exec as execCb, execSync } from 'node:child_process'
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

/**
 *
 * @param cmd command to execute
 * @param stdio terminal output mode. default: `inherit`
 */
export function exec(
  cmd: string,
  stdio: 'inherit' | 'ignore' = 'inherit'
): Buffer {
  return execSync(cmd, { stdio })
}

export async function execAsync(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execCb(cmd, (error, stdout, stderr) => {
      stderr ? reject(stderr) : resolve(stdout)
    })
  })
}

export function hasParams(): boolean {
  return process.argv.length > 3
}

export function getParams(): string[] {
  return process.argv.slice(3).filter(Boolean)
}
