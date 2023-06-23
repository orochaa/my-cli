import { makeSut } from '@/tests/mocks/make-sut'
import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { createApi } from '@mist3rbru/create-ts-api'
import p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => 'my-api')
}))

jest.mock('@mist3rbru/create-ts-api', () => ({
  createApi: jest.fn(async () => {})
}))

describe('api', () => {
  const sut = makeSut('api')

  beforeEach(() => {
    clearParams()
  })

  it('should call prompts with proper placeholder', async () => {
    await sut.exec()

    expect(p.text).toHaveBeenCalledTimes(1)
    expect(p.text).toHaveBeenCalledWith({
      message: expect.any(String),
      placeholder: 'my-api',
      validate: expect.any(Function)
    })
  })

  it('should create api with prompt response', async () => {
    await sut.exec()

    expect(createApi).toHaveBeenCalledTimes(1)
    expect(createApi).toHaveBeenCalledWith('my-api')
  })

  it('should create api with cmd params', async () => {
    mockParams('param-api')

    await sut.exec()

    expect(createApi).toHaveBeenCalledTimes(1)
    expect(createApi).toHaveBeenCalledWith('param-api')
  })
})
