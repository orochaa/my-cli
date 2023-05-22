import axios from 'axios'
import { makeSut } from '../mocks/make-sut'
import { mockParams } from '../mocks/mock-params'

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

jest.spyOn(process, 'exit').mockImplementation((() => {}) as any)

describe('http', () => {
  const sut = makeSut('http')

  it('should complete host and port', async () => {
    mockParams('/user')
    await sut.exec()

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/user', {
      headers: {}
    })
  })

  it('should complete host', async () => {
    mockParams(':3030/user')
    await sut.exec()

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3030/user', {
      headers: {}
    })
  })

  it('should not complete', async () => {
    mockParams('http://localhost:3000/user')
    await sut.exec()

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/user', {
      headers: {}
    })
  })

  it('should exit on invalid url', async () => {
    mockParams('foo')
    await sut.exec()

    expect(process.exit).toHaveBeenCalledTimes(1)
  })

  it('should parse nested body', async () => {
    mockParams(
      'post /user key1=1 key2.subset1=true key2.subset2=false key3=Hello+World key4.subset1.subset2=3.14'
    )
    await sut.exec()

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
    mockParams('post /user h.foo=bar h.bar=baz')
    await sut.exec()

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/user',
      '{}',
      {
        headers: { foo: 'bar', bar: 'baz' }
      }
    )
  })

  it('should log http response', async () => {
    const log = jest.spyOn(console, 'log').mockImplementationOnce(() => {})
    const result = {
      data: {
        user: {
          id: 1,
          name: 'John'
        }
      }
    }
    ;(axios.get as jest.Mock).mockResolvedValueOnce(result)

    process.argv = ['node', 'index.js', 'http', 'get', '/user']
    await sut.exec()

    expect(log).toHaveBeenCalledWith(result.data)
  })

  it('should call put method', async () => {
    mockParams('put /user')
    await sut.exec()

    expect(axios.put).toHaveBeenCalledTimes(1)
  })

  it('should call delete method', async () => {
    mockParams('delete /user')
    await sut.exec()

    expect(axios.delete).toHaveBeenCalledTimes(1)
  })
})
