import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { cwd } from '@/utils/constants'
import { NotFoundError } from '@/utils/errors'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

const mock = 'test-delete.mock'
const mockPath = join(cwd, mock)

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => mock),
  confirm: jest.fn(async () => true),
  multiselect: jest.fn(async () => [mock]),
  outro: jest.fn()
}))

const verifyMock = () => !existsSync(mockPath)

describe('remove', () => {
  const sut = makeSut('remove')

  beforeEach(() => {
    writeFileSync(mockPath, '')
    clearParams()
  })

  afterAll(() => {
    if (!verifyMock()) {
      rmSync(mockPath)
    }
  })

  it('should delete prompt select item', async () => {
    ;(p.confirm as jest.Mock).mockResolvedValueOnce(true)

    await sut.exec()

    expect(verifyMock()).toBeTruthy()
    expect(p.outro).toHaveBeenCalledWith(`Removed: ${mockPath}`)
  })

  it('should delete prompt text item', async () => {
    ;(p.confirm as jest.Mock).mockResolvedValueOnce(false)

    await sut.exec()

    expect(verifyMock()).toBeTruthy()
    expect(p.outro).toHaveBeenCalledWith(`Removed: ${mockPath}`)
  })

  it('should delete params item', async () => {
    mockParams(mock)

    await sut.exec()

    expect(verifyMock()).toBeTruthy()
    expect(p.outro).toHaveBeenCalledWith(`Removed: ${mockPath}`)
  })

  it('should verify param item', async () => {
    rmSync(mockPath)
    mockParams(mock)

    expect(sut.exec()).rejects.toThrowError(NotFoundError)
  })
})
