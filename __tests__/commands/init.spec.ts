import { makeSut } from '@/tests/mocks/make-sut.js'
import { cwd } from '@/utils/constants.js'
import cp from 'node:child_process'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { mockExec } from '../mocks/utils.js'

jest.mock('@clack/prompts', () => ({
  spinner: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}))

describe('init', () => {
  const sut = makeSut('init')

  beforeAll(() => {
    mockExec('origin')
  })

  it('should init project on current dir', async () => {
    const writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation()
    const mkdirSpy = jest.spyOn(fs, 'mkdir').mockImplementation()
    jest
      .spyOn(fsSync, 'existsSync')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)

    await sut.exec()

    expect(cp.exec).toHaveBeenCalledTimes(3)
    expect(writeFileSpy).toHaveBeenCalledTimes(8)
    expect(mkdirSpy).toHaveBeenCalledTimes(1)
    expect(mkdirSpy).toHaveBeenCalledWith(path.join(cwd, 'src'))
  })

  it('should init project on given dir', async () => {
    const writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation()
    const mkdirSpy = jest.spyOn(fs, 'mkdir').mockImplementation()
    jest.spyOn(process, 'chdir').mockImplementation()
    jest
      .spyOn(fsSync, 'existsSync')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    const param = 'param-project'
    await sut.exec(param)

    expect(cp.exec).toHaveBeenCalledTimes(3)
    expect(writeFileSpy).toHaveBeenCalledTimes(8)
    expect(mkdirSpy).toHaveBeenCalledTimes(2)
    expect(mkdirSpy).toHaveBeenCalledWith(path.join(cwd, param))
    expect(mkdirSpy).toHaveBeenCalledWith(path.join(cwd, param, 'src'))
  })
})
