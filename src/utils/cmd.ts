import { exec as execCallback } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execCallback)

function goTo(folder: string): string {
  return `cd ${join(process.cwd(), folder)}`
}

export function errorHandler(error: Error): never {
  process.stdout.write(`${error.name}: `)
  process.stdout.write(error.message)
  process.stdout.write('\n')
  process.exit(1)
}

export function print(msg: string): void {
  process.stdout.write(`> ${msg}\n`)
}

export async function remove(folder: string, item: string): Promise<void> {
  await rm(join(folder, item), { recursive: true })
}

export async function createFolder(folder: string): Promise<void> {
  mkdir(join(process.cwd(), folder))
}

export async function cloneRepository(
  repo: string,
  folder: string
): Promise<void> {
  await exec(`git clone --depth 1 ${repo} ${folder}`)
}

export async function install(folder: string): Promise<void> {
  await exec(`${goTo(folder)} && pnpm install`)
}
