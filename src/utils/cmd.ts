import { exec as execCb, execSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import pacote from 'pacote'
import { myCliPackageJsonPath, packageName } from './constants.js'
import { NotFoundError } from './errors.js'
import { readPackageJson } from './file-system.js'

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
      stderr ? reject(error as Error) : resolve(stdout)
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

  let flagLoopShouldBreak = false

  for (const flag of flags) {
    for (const _target of target) {
      if (flag === _target) {
        result = true
        flagLoopShouldBreak = true
        break
      }
    }

    if (flagLoopShouldBreak) {
      break
    }
  }

  return result
}

export function isSilent(): boolean {
  return hasFlag('--silent')
}

interface Version {
  current: string
  latest: string
}

export async function execOutdated(): Promise<Version | null> {
  const manifestInfo = await pacote.manifest(packageName, {
    fullMetadata: true,
  })
  const packageJson = readPackageJson(myCliPackageJsonPath)

  if (!packageJson) {
    throw new NotFoundError(`${packageName}.packageJson`)
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    current: packageJson.version!,
    latest: manifestInfo.version,
  }
}
