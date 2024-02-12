import { makeSut } from '@/tests/mocks/make-sut.js'
import { packageJsonPath } from '@/utils/constants.js'
import { MissingParamError, NotFoundError } from '@/utils/errors.js'
import fs from 'node:fs'
import * as p from '@clack/prompts'

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(() => ['lint', 'jest']),
}))

jest.spyOn(fs, 'writeFileSync').mockImplementation()

describe('scripts', () => {
  const sut = makeSut('scripts')

  it('should use scripts prompt', async () => {
    await sut.exec()

    expect(p.multiselect).toHaveBeenCalledTimes(1)
  })

  it('should use param scripts', async () => {
    await sut.exec('lint')

    expect(p.multiselect).toHaveBeenCalledTimes(0)
  })

  it('should throw on missing scripts param', async () => {
    ;(p.multiselect as jest.Mock).mockResolvedValueOnce([])

    await expect(sut.exec()).rejects.toThrow(MissingParamError)
  })

  it('should throw on missing package.json', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false)

    await expect(sut.exec()).rejects.toThrow(NotFoundError)
  })

  it('should write package.json', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({})

    await sut.exec('lint', 'test')

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      packageJsonPath,
      JSON.stringify(
        {
          scripts: {
            lint: 'run-s lint:tsc lint:prettier lint:eslint',
            'lint:tsc': 'tsc --noEmit',
            'lint:prettier': 'prettier --write .',
            'lint:eslint': 'eslint --fix "src/**/*.ts" "__tests__/**/*.ts"',
          },
        },
        null,
        2,
      ),
    )
  })
})
