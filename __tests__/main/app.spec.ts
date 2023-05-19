import { App } from '@/main/app'
import picocolors from 'picocolors'

const makeSut = () => {
  return new App()
}

jest.spyOn(global.process, 'exit').mockImplementation(() => ({} as never))

describe('App', () => {
  it('should not exec unknown command', () => {
    const sut = makeSut()

    sut.exec('foo')

    expect(process.exit).toHaveBeenCalledTimes(1)
  })

  it('should exec known command', () => {
    const sut = makeSut()
    let data

    sut.register({
      name: 'foo',
      action: async (params, flags) => {
        data = { params, flags }
      }
    } as App.Command)
    process.argv = ['node', 'index.js', 'foo', 'bar', '--baz']
    sut.exec('foo')

    expect(data).toStrictEqual({
      params: ['bar'],
      flags: ['--baz']
    })
  })

  it('should exec known command by alias', () => {
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
    sut.exec('f')

    expect(data).toStrictEqual({
      params: ['bar'],
      flags: ['--baz']
    })
  })

  it('should display all known commands', () => {
    const sut = makeSut()
    const log = jest.spyOn(process.stdout, 'write')

    sut.register({ name: 'foo' } as App.Command)
    sut.register({ name: 'bar' } as App.Command)
    sut.register({ name: 'baz' } as App.Command)
    sut.displayCommands()

    expect(log).toHaveBeenCalledWith(
      `${picocolors.magenta('-')} command: ${picocolors.cyan('foo')}\n`
    )
    expect(log).toHaveBeenCalledWith(
      `${picocolors.magenta('-')} command: ${picocolors.cyan('bar')}\n`
    )
    expect(log).toHaveBeenCalledWith(
      `${picocolors.magenta('-')} command: ${picocolors.cyan('baz')}\n`
    )
  })
})
