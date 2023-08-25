import { objectKeys } from '@/utils/mappers.js'
import { stdin, stdout } from 'node:process'
import readline from 'node:readline'
import * as p from '@clack/prompts'

export type PromptOption<TValue, TLabel extends string = string> = {
  value: TValue
  label: TLabel
  hint?: string
}

type Primitive = string | number | boolean | undefined

type PrimitiveArray<T = Primitive> = T extends Primitive ? T[] : never

type PromptResponse = Primitive | PrimitiveArray | Record<string, unknown>

type ResponseMapper<T> = T extends Primitive
  ? T
  : {
      [K in keyof T]: T[K] extends infer U | symbol ? U : T[K]
    }

export function verifyPromptResponse<TResponse extends PromptResponse>(
  response: TResponse | symbol
): asserts response is TResponse & ResponseMapper<TResponse> {
  verifySymbol(response)
  if (typeof response === 'object') {
    for (const key of objectKeys(response)) {
      verifySymbol(response[key])
    }
  }
}

function verifySymbol<T>(data: T | symbol): asserts data is T {
  if (typeof data === 'symbol') {
    p.cancel('command cancelled.')
    process.exit(0)
  }
}

// Reference: https://github.com/terkelg/sisteransi/blob/master/src/index.js
const ESC = '\x1B'
const CSI = `${ESC}[`
const cursor = {
  hide: `${CSI}?25l`,
  show: `${CSI}?25h`
}

// Reference: https://github.com/natemoo-re/clack/blob/main/packages/core/src/utils.ts
export function block({
  input = stdin,
  output = stdout,
  overwrite = true,
  hideCursor = true
} = {}) {
  const rl = readline.createInterface({
    input,
    output,
    prompt: '',
    tabSize: 1
  })
  readline.emitKeypressEvents(input, rl)
  if (input.isTTY) input.setRawMode(true)

  const clear = (data: Buffer, { name }: readline.Key) => {
    const str = String(data)
    if (str === '\x03') {
      process.exit(0)
    }
    if (!overwrite) return
    let dx = name === 'return' ? 0 : -1
    let dy = name === 'return' ? -1 : 0

    readline.moveCursor(output, dx, dy, () => {
      readline.clearLine(output, 1, () => {
        input.once('keypress', clear)
      })
    })
  }
  if (hideCursor) process.stdout.write(cursor.hide)
  input.once('keypress', clear)

  return () => {
    input.off('keypress', clear)
    if (hideCursor) process.stdout.write(cursor.show)

    // @ts-expect-error fix for https://github.com/nodejs/node/issues/31762#issuecomment-1441223907
    rl.terminal = false
    rl.close()
  }
}
