import { mockParams } from '@/tests/mocks/mock-params'
import { openCommand } from '@/commands'
import { cwd } from '@/utils/constants'
import { writeLockfile } from '@/utils/file-system'
import cp from 'node:child_process'
import { readdirSync } from 'node:fs'

const projects = readdirSync(cwd).filter(folder => !/\.\w+$/.test(folder))

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => projects)
}))

jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as any))

describe('openCommand', () => {
  beforeAll(() => {
    writeLockfile({
      git: 'Mist3rBru',
      projects: [cwd]
    })
  })

  beforeEach(() => {
    mockParams([])
  })

  it('should open all prompt options', async () => {
    await openCommand()

    expect(cp.execSync).toHaveBeenCalledTimes(projects.length)
  })

  it('should catch all parameters errors', async () => {
    mockParams(['any-project', 'other-project'])

    await openCommand()

    expect(cp.execSync).toHaveBeenCalledTimes(0)
  })

  it('should open all parameters options', async () => {
    mockParams(projects)

    await openCommand()

    expect(cp.execSync).toHaveBeenCalledTimes(projects.length)
  })
})
