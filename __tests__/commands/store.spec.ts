import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
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

describe('store', () => {
  const sut = makeSut('store')

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
    await sut.exec()

    expect(readLockfile()).toStrictEqual({
      any: 'any'
    })
  })

  it('should store key-value of params', async () => {
    mockParams('key1=foo key2.subset1=bar')

    await sut.exec()

    expect(readLockfile()).toStrictEqual({
      key1: 'foo',
      key2: {
        subset1: 'bar'
      }
    })
  })

  it('should delete empty key of params', async () => {
    writeLockfile({
      key1: 'foo',
      key2: 'bar'
    })

    mockParams('key1=')
    await sut.exec()

    expect(readLockfile()).toStrictEqual({
      key2: 'bar'
    })
  })
})
