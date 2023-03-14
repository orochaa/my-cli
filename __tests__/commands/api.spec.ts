import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { apiCommand } from '@/commands'
import { createApi } from '@mist3rbru/create-ts-api'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => 'my-api')
}))

jest.mock('@mist3rbru/create-ts-api', () => ({
  createApi: jest.fn(async () => {})
}))

jest.spyOn(global.process, 'exit').mockImplementation(() => ({} as never))

describe('apiCommand', () => {
  beforeEach(() => {
    clearParams()
  })

  it('should call prompts with proper placeholder', async () => {
    await apiCommand()

    expect(p.text).toHaveBeenCalledTimes(1)
    expect(p.text).toHaveBeenCalledWith({
      message: expect.any(String),
      placeholder: 'my-api',
      validate: expect.any(Function)
    })
  })

  it('should create api with prompt response', async () => {
    await apiCommand()

    expect(createApi).toHaveBeenCalledTimes(1)
    expect(createApi).toHaveBeenCalledWith('my-api')
  })

  it('should create api with cmd params', async () => {
    mockParams('param-api')

    await apiCommand()

    expect(createApi).toHaveBeenCalledTimes(1)
    expect(createApi).toHaveBeenCalledWith('param-api')
  })
})
