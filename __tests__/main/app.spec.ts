import { App } from '@/main/app'
import colors from 'picocolors'

const makeSut = () => {
  return new App()
}

describe('App', () => {
  it('should not exec unknown command', async () => {
    const sut = makeSut()
    const errorHandlerSpy = jest
      .spyOn(sut, 'errorHandler')
      .mockImplementation()

    await sut.exec('foo')

    expect(errorHandlerSpy).toHaveBeenCalledTimes(1)
  })

  it('should exec known command', async () => {
    const sut = makeSut()
    let data

    sut.register({
      name: 'foo',
      action: async (params, flags) => {
        data = { params, flags }
      }
    } as App.Command)
    process.argv = ['node', 'index.js', 'foo', 'bar', '--baz']
    await sut.exec('foo')

    expect(data).toStrictEqual({
      params: ['bar'],
      flags: ['--baz']
    })
  })

  it('should exec known command by alias', async () => {
    const sut = makeSut()
    let data

    sut.register({
      name: 'foo',
      alias: 'f',
      action: async (params, flags) => {
        data = { params, flags }
      }
    } as App.Command)
    process.argv = ['node', 'index.js', 'f', 'bar', '--baz']
    await sut.exec('f')

    expect(data).toStrictEqual({
      params: ['bar'],
      flags: ['--baz']
    })
  })

  it('should throw on error', async () => {
    const sut = makeSut()

    sut.register({
      name: 'foo',
      action: async (params, flags): Promise<void> => {
        throw new Error('')
      }
    } as App.Command)

    expect(sut.exec('foo')).rejects.toThrow()
  })

  it('should display all known commands', async () => {
    const sut = makeSut()
    const log = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((() => {}) as any)

    sut.register({
      name: 'foo',
      action: async () => {},
      alias: ' ',
      description: ' ',
      example: 'my ',
      params: [' '],
      flags: [' ']
    })
    sut.register({
      name: 'bar',
      action: async () => {},
      alias: ' ',
      description: ' ',
      example: 'my ',
      params: [' '],
      flags: [' ']
    })
    sut.register({
      name: 'baz',
      action: async () => {},
      alias: ' ',
      description: ' ',
      example: 'my ',
      params: [' '],
      flags: [' ']
    })
    sut.displayCommands()

    expect(log).toHaveBeenCalledWith(
      `${colors.magenta('-')} command: ${colors.cyan('foo')}\n`
    )
    expect(log).toHaveBeenCalledWith(
      `${colors.magenta('-')} command: ${colors.cyan('bar')}\n`
    )
    expect(log).toHaveBeenCalledWith(
      `${colors.magenta('-')} command: ${colors.cyan('baz')}\n`
    )
  })
})
