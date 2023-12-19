import { App } from '@/main/app.js'
import colors from 'picocolors'

const makeSut = (): App => {
  return new App()
}

describe('App', () => {
  it('should not exec unknown command', async () => {
    const sut = makeSut()
    const handleErrorSpy = jest.spyOn(sut, 'handleError').mockImplementation()

    await sut.exec('foo')

    expect(handleErrorSpy).toHaveBeenCalledTimes(1)
  })

  it('should exec known command', async () => {
    const sut = makeSut()
    let data

    sut.register({
      name: 'foo',
      action: async (params, flags) => {
        data = { params, flags }
      },
    } as App.Command)
    process.argv = ['node', 'index.js', 'foo', 'bar', '--baz']
    await sut.exec('foo')

    expect(data).toStrictEqual({
      params: ['bar'],
      flags: ['--baz'],
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
      },
    } as App.Command)
    process.argv = ['node', 'index.js', 'f', 'bar', '--baz']
    await sut.exec('f')

    expect(data).toStrictEqual({
      params: ['bar'],
      flags: ['--baz'],
    })
  })

  it('should throw on error', async () => {
    const sut = makeSut()

    sut.register({
      name: 'foo',
      action: async (params, flags): Promise<void> => {
        throw new Error('')
      },
    } as App.Command)

    await expect(sut.exec('foo')).rejects.toThrow()
  })

  it('should display command', async () => {
    const sut = makeSut()
    const log = jest.spyOn(process.stdout, 'write').mockImplementation()

    sut.displayCommand({
      name: 'foo',
      action: async () => {},
      alias: 'f',
      description: 'foo description',
      example: 'my foo',
      params: ['p1', 'p2'],
      flags: ['f1', 'f2'],
    })

    expect(log).toHaveBeenCalledWith(
      `${colors.magenta('-')} command: ${colors.cyan('foo')}\n`,
    )
    expect(log).toHaveBeenCalledWith('  alias: f\n')
    expect(log).toHaveBeenCalledWith(
      `  params: ${colors.magenta('`p1`')} | ${colors.magenta('`p2`')}\n`,
    )
    expect(log).toHaveBeenCalledWith(
      `  flags: ${colors.magenta('`f1`')} | ${colors.magenta('`f2`')}\n`,
    )
    expect(log).toHaveBeenCalledWith('  description: foo description\n')
    expect(log).toHaveBeenCalledWith('  example: my foo\n\n')
  })

  it('should display all known commands', async () => {
    const sut = makeSut()
    const log = jest.spyOn(process.stdout, 'write').mockImplementation()

    sut.register({
      name: 'foo',
      action: async () => {},
      alias: ' ',
      description: ' ',
      example: 'my ',
      params: [' '],
      flags: [' '],
    })
    sut.register({
      name: 'bar',
      action: async () => {},
      alias: ' ',
      description: ' ',
      example: 'my ',
      params: [' '],
      flags: [' '],
    })
    sut.register({
      name: 'baz',
      action: async () => {},
      alias: ' ',
      description: ' ',
      example: 'my ',
      params: [' '],
      flags: [' '],
    })
    sut.displayAllCommands()

    expect(log).toHaveBeenCalledWith(
      `${colors.magenta('-')} command: ${colors.cyan('foo')}\n`,
    )
    expect(log).toHaveBeenCalledWith(
      `${colors.magenta('-')} command: ${colors.cyan('bar')}\n`,
    )
    expect(log).toHaveBeenCalledWith(
      `${colors.magenta('-')} command: ${colors.cyan('baz')}\n`,
    )
  })

  it('should log error', async () => {
    const sut = makeSut()
    const log = jest.spyOn(process.stdout, 'write').mockImplementation()
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation()

    sut.handleError(new Error('test error'))

    expect(exitSpy).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith('Error: test error\n')
  })

  it('should not log error', async () => {
    const sut = makeSut()
    const log = jest.spyOn(process.stdout, 'write').mockImplementation()
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation()

    process.argv = ['--silent']
    sut.handleError(new Error('test error'))

    expect(exitSpy).toHaveBeenCalledTimes(1)
    expect(log).not.toHaveBeenCalled()
  })
})
