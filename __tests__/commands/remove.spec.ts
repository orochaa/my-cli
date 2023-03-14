import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { removeCommand } from '@/commands'
import { cwd } from '@/utils/constants'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'

const mock = 'test-delete.mock'
const mockPath = join(cwd, mock)

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => mock),
  outro: jest.fn()
}))

const verifyMock = () => !existsSync(mockPath)

describe('removeCommand', () => {
  beforeEach(() => {
    writeFileSync(mockPath, '')
    clearParams()
  })

  afterAll(() => {
    if (!verifyMock()) {
      rmSync(mockPath)
    }
  })

  it('should delete prompt item', async () => {
    await removeCommand()

    expect(verifyMock()).toBeTruthy()
    expect(p.outro).toHaveBeenCalledWith(`Removed: ${mockPath}`)
  })

  it('should delete params item', async () => {
    mockParams(mock)

    await removeCommand()

    expect(verifyMock()).toBeTruthy()
    expect(p.outro).toHaveBeenCalledWith(`Removed: ${mockPath}`)
  })

  it('should verify param item', async () => {
    rmSync(mockPath)
    mockParams(mock)
    const exitSpy = jest.spyOn(global.process, 'exit')
    exitSpy.mockImplementation(() => ({} as never))

    await removeCommand()

    expect(exitSpy).toHaveBeenCalledTimes(1)
  })
})
