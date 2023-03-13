import { setupCommand } from '@/commands'
import { storeLockFilePath } from '@/utils/constants'
import { readLockfile, writeLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { existsSync, rmSync } from 'fs'
import * as p from '@clack/prompts'

const mock = {
  git: 'Mist3rBru',
  projects: ['Mist3rBru']
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
    if (existsSync(storeLockFilePath)) {
      rmSync(storeLockFilePath)
    }
  })

  afterEach(() => {
    if (existsSync(storeLockFilePath)) {
      rmSync(storeLockFilePath)
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

  it('should end process on exit', async () => {
    ;(p.text as jest.Mock).mockResolvedValueOnce(Symbol())

    await setupCommand()

    expect(process.exit).toHaveBeenCalledTimes(1)
  })

  it('should store the result', async () => {
    await setupCommand()

    expect(readLockfile()).toStrictEqual(mock)
  })
})
