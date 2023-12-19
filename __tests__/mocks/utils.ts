import cp from 'node:child_process'
import fs from 'node:fs'

export function mockJsonParse(
  value: Record<string, unknown> | null,
  once?: boolean,
): jest.SpyInstance {
  const spy = jest.spyOn(JSON, 'parse')
  jest.spyOn(fs, 'readFileSync').mockImplementation(() => '')
  if (once) {
    spy.mockReturnValueOnce(value)
  } else {
    spy.mockReturnValue(value)
  }
  return spy
}

export function mockExec(result: string): jest.SpyInstance {
  const spy = jest.spyOn(cp, 'exec')

  // @ts-expect-error
  spy.mockImplementation((_cmd, cb) => {
    // @ts-expect-error
    cb(null, result, '')
    return cp
  })

  return spy
}
