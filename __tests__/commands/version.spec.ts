import { makeSut } from '@/tests/mocks/make-sut.js'
import { getPackageJson } from '@/utils/file-system.js'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  outro: jest.fn(),
}))

jest.mock('@/utils/file-system.js', () => ({
  getPackageJson: jest.fn(() => ({
    version: '1.0.0',
  })),
}))

describe('version', () => {
  const sut = makeSut('version')

  it('should print current package version', async () => {
    await sut.exec()

    expect(p.outro).toHaveBeenCalledTimes(1)
    expect(p.outro).toHaveBeenCalledWith('v1.0.0')
  })

  it('should print an error response', async () => {
    ;(getPackageJson as jest.Mock).mockReturnValueOnce({})

    await sut.exec()

    expect(p.outro).toHaveBeenCalledTimes(1)
    expect(p.outro).not.toHaveBeenCalledWith('v1.0.0')
  })
})
