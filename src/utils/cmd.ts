import { exec as execCb, execSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

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

export function hasFlag(target: string | string[], flags: string[]): boolean {
  let result = false

  if (typeof target === 'string') {
    target = [target]
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
  return hasFlag('--silent', process.argv)
}
