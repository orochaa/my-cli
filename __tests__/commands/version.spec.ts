import { makeSut } from '@/tests/mocks/make-sut.js'
import * as p from '@clack/prompts'
import { version } from '../../package.json'

jest.mock('@clack/prompts', () => ({
  outro: jest.fn(),
}))

describe('version', () => {
  const sut = makeSut('version')

  it('should print current package version', async () => {
    await sut.exec()

    expect(p.outro).toHaveBeenCalledTimes(1)
    expect(p.outro).toHaveBeenCalledWith(`v${version}`)
  })
})
