import { makeSut } from '@/tests/mocks/make-sut.js'
import cp from 'node:child_process'
import fs from 'node:fs/promises'

jest.mock('@clack/prompts', () => ({
  spinner: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}))

describe('init', () => {
  const sut = makeSut('init')

  it('should init project by cmd commands', async () => {
    const execSpy = jest.spyOn(cp, 'exec').mockImplementation((cmd, cb) => {
      ;(cb as any)(null, 'origin', '')
      return cp as any
    })
    const writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation()
    const mkdirSpy = jest.spyOn(fs, 'mkdir').mockImplementation()

    await sut.exec()

    expect(execSpy).toHaveBeenCalledTimes(3)
    expect(writeFileSpy).toHaveBeenCalledTimes(6)
    expect(mkdirSpy).toHaveBeenCalledTimes(1)
  })
})
