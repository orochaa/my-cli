import { makeSut } from '@/tests/mocks/make-sut'
import { InvalidParamError, MissingParamError } from '@/utils/errors'
import axios from 'axios'

jest.mock('axios', () => {
  class Axios {
    create = () => this
    get = jest.fn(async () => ({ data: '' }))
    post = jest.fn(async () => ({ data: '' }))
    put = jest.fn(async () => ({ data: '' }))
    delete = jest.fn(async () => ({ data: '' }))
  }
  return new Axios()
})

jest.spyOn(process, 'exit').mockImplementation()

describe('http', () => {
  const sut = makeSut('http')

  it('should throw on missing params', async () => {
    const promise = sut.exec()

    expect(promise).rejects.toThrowError(MissingParamError)
  })

  it('should complete host and port', async () => {
    await sut.exec('/user')

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/user', {
      headers: {}
    })
  })

  it('should complete host', async () => {
    await sut.exec(':3030/user')

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3030/user', {
      headers: {}
    })
  })

  it('should not complete', async () => {
    await sut.exec('http://localhost:3000/user')

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/user', {
      headers: {}
    })
  })

  it('should throw on invalid url', async () => {
    const promise = sut.exec('foo')

    expect(promise).rejects.toThrowError(InvalidParamError)
  })

  it('should parse nested body', async () => {
    await sut.exec(
      'post /user key1=1 key2.subset1=true key2.subset2=false key3=Hello+World key4.subset1.subset2=3.14'
    )

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/user',
      JSON.stringify({
        key1: 1,
        key2: {
          subset1: true,
          subset2: false
        },
        key3: 'Hello World',
        key4: {
          subset1: {
            subset2: 3.14
          }
        }
      }),
      {
        headers: {}
      }
    )
  })

  it('should parse headers', async () => {
    await sut.exec('post /user h.foo=bar h.bar=baz')

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/user',
      '{}',
      {
        headers: { foo: 'bar', bar: 'baz' }
      }
    )
  })

  it('should log http response', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation()
    const result = {
      data: {
        user: {
          id: 1,
          name: 'John'
        }
      }
    }
    ;(axios.get as jest.Mock).mockResolvedValueOnce(result)

    sut.enableLogs()
    await sut.exec('get', '/user')

    expect(log).toHaveBeenCalledWith(result.data)
  })

  it('should call put method', async () => {
    await sut.exec('put /user')

    expect(axios.put).toHaveBeenCalledTimes(1)
  })

  it('should call delete method', async () => {
    await sut.exec('delete /user')

    expect(axios.delete).toHaveBeenCalledTimes(1)
  })
})
