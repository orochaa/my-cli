import fs from 'node:fs'

export function mockJsonParse(
  value: Record<string, unknown> | null,
  once?: boolean,
): void {
  const spy = jest.spyOn(JSON, 'parse')
  jest.spyOn(fs, 'readFileSync').mockImplementation(() => '')
  if (once) {
    spy.mockReturnValueOnce(value)
  } else {
    spy.mockReturnValue(value)
  }
}
