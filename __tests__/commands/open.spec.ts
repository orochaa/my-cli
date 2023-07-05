import { makeSut } from '@/tests/mocks/make-sut'
import { cwd, lockfilePath } from '@/utils/constants'
import { writeLockfile } from '@/utils/file-system'
import cp, { exec } from 'node:child_process'
import fs, { Dirent } from 'node:fs'
import { join } from 'node:path'
import p from '@clack/prompts'

const mockDirent = (folders: string[]): Dirent[] => {
  return folders.map(
    folder =>
      ({
        name: folder,
        isDirectory: () => true
      }) as Dirent
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
  multiselect: jest.fn(async () => [cwd]),
  confirm: jest.fn(async () => false)
}))

jest.spyOn(cp, 'execSync').mockImplementation()

describe('open', () => {
  const sut = makeSut('open')

  beforeEach(() => {
    writeLockfile({ projects: [cwd] })
  })

  afterAll(() => {
    if (fs.existsSync(lockfilePath)) {
      fs.rmSync(lockfilePath)
    }
  })

  it('should not open invalid projects', async () => {
    mockReaddir(['project'])

    await sut.exec('not-a-project', 'neither-a-project')

    expect(cp.execSync).toHaveBeenCalledTimes(0)
  })

  it('should open projects', async () => {
    const projects = ['any-project', 'other-project']
    mockReaddir(projects)

    await sut.exec(...projects)

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, projects[0])}`,
      expect.anything()
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, projects[1])}`,
      expect.anything()
    )
  })

  it('should differ projects by root', async () => {
    writeLockfile({ projects: [join(cwd, '/root1'), join(cwd, '/root2')] })
    mockReaddir(['project'])

    await sut.exec('project', 'root2/project')

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, '/root1/project')}`,
      expect.anything()
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, '/root2/project')}`,
      expect.anything()
    )
  })

  it('should open all projects on workspace', async () => {
    const projects = ['any-project', 'other-project']
    mockReaddir(projects)

    await sut.exec(...projects, '-w')

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, projects[0])} ${join(cwd, projects[1])}`,
      expect.anything()
    )
  })

  it('should open project on same window', async () => {
    const project = 'any-project'
    mockReaddir([project])

    await sut.exec(project, '-r')

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, project)} --reuse-window`,
      expect.anything()
    )
  })

  it('should open workspace and reuse window', async () => {
    const projects = ['any-project', 'other-project']
    mockReaddir(projects)

    await sut.exec(...projects, '-w', '-r')
    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, projects[0])} ${join(cwd, projects[1])} --reuse-window`,
      expect.anything()
    )

    await sut.exec(...projects, '-r')
    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, projects[0])} ${join(cwd, projects[1])} --reuse-window`,
      expect.anything()
    )
  })

  it("should not display path's root on prompt", async () => {
    writeLockfile({
      projects: [
        '~/root/sub1',
        'C:/root/sub2',
        '/root/sub3',
        '~\\root\\sub4',
        'C:\\root\\sub5',
        '\\root\\sub6',
        '\\root'
      ]
    })
    mockReaddir(['project'])

    await sut.exec()

    expect(p.multiselect).toHaveBeenCalledWith({
      message: expect.any(String),
      options: [
        { label: 'sub1/project', value: '~/root/sub1/project' },
        { label: 'sub2/project', value: 'C:/root/sub2/project' },
        { label: 'sub3/project', value: '/root/sub3/project' },
        { label: 'sub4/project', value: '~\\root\\sub4/project' },
        { label: 'sub5/project', value: 'C:\\root\\sub5/project' },
        { label: 'sub6/project', value: '\\root\\sub6/project' },
        { label: 'root/project', value: '\\root/project' }
      ]
    })
  })

  it('should open all prompt selected options', async () => {
    ;(p.multiselect as jest.Mock).mockReturnValueOnce([
      join(cwd, '/root1'),
      join(cwd, '/root2')
    ])

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, '/root1')}`,
      expect.anything()
    )
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, '/root2')}`,
      expect.anything()
    )
  })

  it('should open all prompt selected options on workspace', async () => {
    ;(p.multiselect as jest.Mock).mockResolvedValueOnce([
      join(cwd, '/root1'),
      join(cwd, '/root2')
    ])
    ;(p.confirm as jest.Mock).mockResolvedValueOnce(true)

    await sut.exec()

    expect(cp.execSync).toHaveBeenCalledTimes(1)
    expect(cp.execSync).toHaveBeenCalledWith(
      `code ${join(cwd, '/root1')} ${join(cwd, '/root2')}`,
      expect.anything()
    )
  })

  it('should ignore config folders', async () => {
    writeLockfile({ projects: [join(cwd, '/root')] })
    mockReaddir(['.ignore_config', 'project'])

    await sut.exec()

    expect(p.multiselect).toHaveBeenCalledWith({
      message: 'Select a project to open:',
      options: [
        {
          label: 'root/project',
          value: join(cwd, '/root/project')
        }
      ]
    })
  })

  it('should not prompt workspace on single project selection', async () => {
    ;(p.multiselect as jest.Mock).mockResolvedValueOnce([join(cwd, '/root')])

    await sut.exec()

    expect(p.confirm).toHaveBeenCalledTimes(0)
  })
})
