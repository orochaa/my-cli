import { makeSut } from '@/tests/mocks/make-sut.js'
import { lockfilePath } from '@/utils/constants.js'
import { readLockfile, writeLockfile } from '@/utils/file-system.js'
import axios from 'axios'
import { existsSync, rmSync } from 'fs'
import * as p from '@clack/prompts'

const mock = {
  git: 'any',
  projects: ['any'],
}

const startSpy = jest.fn()
const stopSpy = jest.fn()

jest.mock('@clack/prompts', () => ({
  text: jest.fn(async () => mock.git),
  confirm: jest.fn(async options => options.initialValue),
  spinner: jest.fn(() => ({
    start: startSpy,
    stop: stopSpy,
  })),
  outro: jest.fn(),
}))

jest.mock('axios', () => ({
  get: jest.fn(async () => ({
    data: {
      login: '',
      name: '',
    },
  })),
}))

describe('setup', () => {
  const sut = makeSut('setup')

  beforeAll(() => {
    if (existsSync(lockfilePath)) {
      rmSync(lockfilePath)
    }
  })

  afterEach(() => {
    if (existsSync(lockfilePath)) {
      rmSync(lockfilePath)
    }
  })

  it('should render git prompt with no default value', async () => {
    await sut.exec()

    expect(p.text).toHaveBeenCalledTimes(2)
    expect(p.text).toHaveBeenCalledWith({
      message: expect.any(String),
      initialValue: '',
    })
  })

  it('should render git prompt with default value', async () => {
    writeLockfile(mock)

    await sut.exec()

    expect(p.text).toHaveBeenCalledTimes(2)
    expect(p.text).toHaveBeenCalledWith({
      message: expect.any(String),
      initialValue: mock.git,
    })
  })

  it('should validate git user', async () => {
    const data = {
      login: 'user-login',
      name: 'user-name',
    }
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data })

    await sut.exec()

    expect(startSpy).toHaveBeenCalledWith('Validating user')
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.github.com/users/${mock.git}`,
    )
    expect(stopSpy).toHaveBeenCalledWith(`User: ${data.login} | ${data.name}`)
  })

  it('should retry on validation fail', async () => {
    ;(axios.get as jest.Mock).mockRejectedValueOnce('')

    await sut.exec()

    expect(stopSpy).toHaveBeenCalledWith('Invalid user')
    expect(axios.get).toHaveBeenCalledTimes(2)
  })

  it('should store the result', async () => {
    await sut.exec()

    expect(readLockfile()).toStrictEqual(mock)
  })
})
