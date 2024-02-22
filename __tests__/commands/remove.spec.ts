import { makeSut } from '@/tests/mocks/make-sut.js'
import { cwd } from '@/utils/constants.js'
import { NotFoundError } from '@/utils/errors.js'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

const mock = 'test-delete.mock'
const mockPath = join(cwd, mock)

jest.mock('@clack/prompts', () => ({
  text: jest.fn(() => mock),
  confirm: jest.fn(() => true),
  multiselect: jest.fn(() => [mock]),
  outro: jest.fn(),
}))

const verifyMock = (): boolean => !existsSync(mockPath)

describe('remove', () => {
  const sut = makeSut('remove')

  beforeEach(() => {
    writeFileSync(mockPath, '')
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
    await sut.exec(mock)

    expect(verifyMock()).toBeTruthy()
    expect(p.outro).toHaveBeenCalledWith(`Removed: ${mockPath}`)
  })

  it('should verify param item', async () => {
    rmSync(mockPath)
    const promise = sut.exec(mock)
    await expect(promise).rejects.toThrow(NotFoundError)
  })
})
