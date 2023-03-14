import { setupCommand } from '@/commands'
import { lockfilePath } from '@/utils/constants'
import { readLockfile, writeLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { existsSync, rmSync } from 'fs'
import * as p from '@clack/prompts'

const mock = {
  git: 'any',
  projects: ['any']
}

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => mock.git),
  confirm: jest.fn(async () => false),
  group: jest.fn(async (prompts: Record<string, () => Promise<any>>) => {
    const result: any = {}
    objectEntries(prompts).forEach(([key, cb]) => {
      cb().then(res => {
        result[key] = res
      })
    })
    return result
  })
}))

jest.spyOn(global.process, 'exit').mockImplementation(() => ({} as never))

describe('setupCommand', () => {
  beforeAll(() => {
    if (existsSync(lockfilePath)) {
      rmSync(lockfilePath)
    }
  })

  afterEach(() => {
    if (existsSync(lockfilePath)) {
      rmSync(lockfilePath)
    }
  })

  it('should call prompts with default value', async () => {
    writeLockfile(mock)
    await setupCommand()

    expect(p.text).toHaveBeenCalledTimes(2)
    expect(p.text).toHaveBeenCalledWith({
      message: expect.any(String),
      initialValue: mock.git
    })
    expect(p.group).toBeCalledTimes(1)
  })

  it('should call prompts with default value', async () => {
    await setupCommand()

    expect(p.text).toHaveBeenCalledTimes(2)
    expect(p.text).toHaveBeenCalledWith({
      message: expect.any(String),
      initialValue: undefined
    })
  })

  it('should store the result', async () => {
    await setupCommand()

    expect(readLockfile()).toStrictEqual(mock)
  })
})
