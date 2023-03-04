import { rm } from 'node:fs/promises'
import { join } from 'node:path'

export function errorHandler(error: Error): never {
  process.stdout.write(`${error.name}: `)
  process.stdout.write(error.message)
  process.stdout.write('\n')
  process.exit(1)
}

export async function remove(folder: string, item: string): Promise<void> {
  await rm(join(folder, item), { recursive: true })
}
