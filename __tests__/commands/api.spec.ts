import { makeSut } from '@/tests/mocks/make-sut.js'
import { createApi } from '@mist3rbru/create-ts-api'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => 'my-api'),
}))

jest.mock('@mist3rbru/create-ts-api', () => ({
  createApi: jest.fn(),
}))

describe('api', () => {
  const sut = makeSut('api')

  it('should create api with cmd params', async () => {
    await sut.exec('my-api')

    expect(createApi).toHaveBeenCalledTimes(1)
    expect(createApi).toHaveBeenCalledWith('my-api')
  })

  it('should display api prompt if no param is provided', async () => {
    await sut.exec()

    expect(p.text).toHaveBeenCalledTimes(1)
  })

  it('should create api with prompt response', async () => {
    await sut.exec()

    expect(createApi).toHaveBeenCalledTimes(1)
    expect(createApi).toHaveBeenCalledWith('my-api')
  })
})
