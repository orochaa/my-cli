import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { InvalidParamError } from '@/utils/errors'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => '20'),
  outro: jest.fn()
}))

describe('password', () => {
  const sut = makeSut('password')

  beforeEach(() => {
    clearParams()
  })

  it('should generate a password with prompt length', async () => {
    await sut.exec()

    expect((p.outro as jest.Mock).mock.calls[0][0]).toHaveLength(20)
  })

  it('should generate a password with params length', async () => {
    mockParams('15')

    await sut.exec()

    expect((p.outro as jest.Mock).mock.calls[0][0]).toHaveLength(15)
  })

  it('should verify password length', async () => {
    expect.assertions(3)
    const edges = ['7', '101', 'NaN']

    for (const edge of edges) {
      mockParams(edge)
      expect(sut.exec()).rejects.toThrowError(InvalidParamError)
    }
  })
})
