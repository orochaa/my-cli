import { exec as execCb, execSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

export async function remove(folder: string, item: string): Promise<void> {
  await rm(join(folder, item), { recursive: true })
}

export function logCommand(cmd: string): string {
  const output = `\n> ${cmd}\n`

  if (!isSilent()) {
    process.stdout.write(output)
  }

  return output
}

/**
 *
 * @param cmd command to execute
 * @param stdio terminal output mode. default: `inherit`
 */
export function exec(
  cmd: string,
  options?: {
    /** @default 'inherit' */
    stdio?: 'inherit' | 'ignore'
    /** @default true */
    log?: boolean
  },
): Buffer {
  options = {
    stdio: isSilent() ? 'ignore' : 'inherit',
    log: true,
    ...options,
  }
  if (options.log) {
    logCommand(cmd)
  }
  return execSync(cmd, { stdio: options.stdio })
}

export async function execAsync(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execCb(cmd, (error, stdout, stderr) => {
      stderr ? reject(error) : resolve(stdout)
    })
  })
}

export function hasFlag(
  flags: string | string[],
  target: string[] = process.argv,
): boolean {
  let result = false

  if (typeof flags === 'string') {
    flags = [flags]
  }

  flagLoop: for (const flag of flags) {
    for (const _target of target) {
      if (flag === _target) {
        result = true
        break flagLoop
      }
    }
  }

  return result
}

export function isSilent(): boolean {
  return hasFlag('--silent')
}

type Version = {
  current: string
  wanted: string
  latest: string
  dependent: string
  location: string
}

type OutdatedResponse = {
  '@mist3rbru/my-cli': Version
}

export async function execOutdated(): Promise<Version | null> {
  const res = await execAsync('npm outdated @mist3rbru/my-cli --global --json')
  const json = JSON.parse(res) as OutdatedResponse | null
  const version = json?.['@mist3rbru/my-cli'] ?? null
  return version
}
