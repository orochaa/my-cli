import { makeSut } from '@/tests/mocks/make-sut'
import cp from 'node:child_process'

describe('init', () => {
  const sut = makeSut('init')

  it('should init project by cmd commands', async () => {
    const execSpy = jest.spyOn(cp, 'execSync')
    execSpy.mockImplementation(() => ({} as any))

    await sut.exec()

    expect(execSpy).toHaveBeenCalledTimes(8)
  })
})
