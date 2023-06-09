import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams } from '@/tests/mocks/mock-params'
import cp from 'node:child_process'

describe('init', () => {
  const sut = makeSut('init')

  it('should init project by cmd commands', async () => {
    const execSpy = jest.spyOn(cp, 'execSync')
    execSpy.mockImplementation(() => ({} as any))

    clearParams()
    await sut.exec()

    expect(execSpy).toHaveBeenCalledTimes(8)
  })
})
