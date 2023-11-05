import { makeSut } from '@/tests/mocks/make-sut.js'
import { root } from '@/utils/constants.js'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

jest.mock('node:fs', () => ({
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(() => ['api', 'api-test', 'nest', 'typescript']),
  writeFileSync: jest.fn(),
  copyFileSync: jest.fn(),
}))

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => ['nest', 'typescript']),
  log: {
    success: jest.fn(),
    warn: jest.fn(),
  },
}))

describe('snippet', () => {
  const sut = makeSut('snippet')

  it('should create project snippet', async () => {
    await sut.exec('--create')

    expect(mkdirSync).toHaveBeenCalledWith(resolve(root, '.vscode'))
    expect(writeFileSync).toHaveBeenCalledWith(
      resolve(root, '.vscode', 'my-cli.code-snippets'),
      '{}\n',
    )
  })

  it('should not recreate project snippet', async () => {
    ;(existsSync as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)

    await sut.exec('--create')

    expect(mkdirSync).not.toHaveBeenCalledWith(resolve(root, '.vscode'))
    expect(writeFileSync).not.toHaveBeenCalledWith(
      resolve(root, '.vscode', 'my-cli.code-snippets'),
      '{}\n',
    )
  })

  it('should create param snippets', async () => {
    await sut.exec('api api-test')

    expect(mkdirSync).toHaveBeenCalledWith(resolve(root, '.vscode'))
    expect(copyFileSync).toHaveBeenCalledWith(
      resolve(root, 'public/snippets/api.code-snippets'),
      resolve(root, '.vscode/api.code-snippets'),
    )
    expect(copyFileSync).toHaveBeenCalledWith(
      resolve(root, 'public/snippets/api-test.code-snippets'),
      resolve(root, '.vscode/api-test.code-snippets'),
    )
  })

  it('should ignore invalid param', async () => {
    await sut.exec('api invalid-param')

    expect(copyFileSync).not.toHaveBeenCalledWith(
      resolve(root, 'public/snippets/invalid-param.code-snippets'),
      resolve(root, '.vscode/invalid-param.code-snippets'),
    )
  })

  it('should create prompt snippets', async () => {
    await sut.exec()

    expect(mkdirSync).toHaveBeenCalledWith(resolve(root, '.vscode'))
    expect(copyFileSync).toHaveBeenCalledWith(
      resolve(root, 'public/snippets/nest.code-snippets'),
      resolve(root, '.vscode/nest.code-snippets'),
    )
    expect(copyFileSync).toHaveBeenCalledWith(
      resolve(root, 'public/snippets/typescript.code-snippets'),
      resolve(root, '.vscode/typescript.code-snippets'),
    )
  })
})
