import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { storeCommand } from '@/commands'
import { lockfilePath } from '@/utils/constants'
import { readLockfile, writeLockfile } from '@/utils/file-system'
import { objectEntries } from '@/utils/mappers'
import { existsSync, rmSync } from 'fs'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => 'any'),
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

describe('storeCommand', () => {
  beforeEach(() => {
    clearParams()
    writeLockfile({})
  })

  afterAll(() => {
    if (existsSync(lockfilePath)) {
      rmSync(lockfilePath)
    }
  })

  it('should store key-value of prompt', async () => {
    await storeCommand()

    expect(readLockfile()).toStrictEqual({
      any: 'any'
    })
  })

  it('should store key-value of params', async () => {
    mockParams('git=any-git')

    await storeCommand()

    expect(readLockfile()).toStrictEqual({
      git: 'any-git'
    })
  })

  it('should delete empty key of params', async () => {
    writeLockfile({
      git: 'any'
    })
    mockParams('git=')

    await storeCommand()

    expect(readLockfile()).toStrictEqual({})
  })
})
