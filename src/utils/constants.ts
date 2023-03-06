import { join } from 'node:path'

export const cwd = process.cwd()

export const tempPath = join(__dirname, '..', 'temp')

export const lockfilePath = join(tempPath, 'store-lock.json')

export const projectsPath = join('C:', 'git')
