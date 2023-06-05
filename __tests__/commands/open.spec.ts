import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { cwd, lockfilePath } from '@/utils/constants'
import { writeLockfile } from '@/utils/file-system'
import cp from 'node:child_process'
import fs, { Dirent } from 'node:fs'
import * as p from '@clack/prompts'

const mockDirent = (folders: string[]): Dirent[] => {
  return folders.map(
    folder =>
      ({
        name: folder,
        isDirectory: () => true
      } as Dirent)
  )
}

const mockReaddir = (paths: string[] | Dirent[]): void => {
  const result: Dirent[] =
    paths[0] instanceof Dirent
      ? (paths as Dirent[])
      : mockDirent(paths as string[])
  jest.spyOn(fs, 'readdirSync').mockImplementation(() => result)
}

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => [cwd])
}))

jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as any))

describe('open', () => {
  const sut = makeSut('open')

  beforeAll(() => {
    writeLockfile({ projects: [cwd] })
  })

  beforeEach(() => {
    clearParams()
  })

  afterAll(() => {
    if (fs.existsSync(lockfilePath)) {
      fs.rmSync(lockfilePath)
    }
  })

  it('should not open invalid projects', async () => {
    mockReaddir(['project'])

    mockParams('not-a-project', 'neither-a-project')
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(0)
  })

  it('should open all valid projects', async () => {
    const projects = ['any-project', 'other-project']
    mockReaddir(projects)

    mockParams(...projects)
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${cwd}\\any-project`,
      expect.anything()
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${cwd}\\other-project`,
      expect.anything()
    )
  })

  it('should differ projects by root', async () => {
    writeLockfile({ projects: [`${cwd}/root1`, `${cwd}/root2`] })
    mockReaddir(['project'])

    mockParams('project', 'root2/project')
    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${cwd}\\root1\\project`,
      expect.anything()
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${cwd}\\root2\\project`,
      expect.anything()
    )
  })

  it('should open all prompt options', async () => {
    ;(p.multiselect as jest.Mock).mockReturnValueOnce([
      `${cwd}\\root1`,
      `${cwd}\\root2`
    ])

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${cwd}\\root1`,
      expect.anything()
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${cwd}\\root2`,
      expect.anything()
    )
  })
})
