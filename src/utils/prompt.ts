import { objectKeys } from '@/utils/mappers.js'
import * as p from '@clack/prompts'

export interface PromptOption<TValue> {
  value: TValue
  label?: string
  hint?: string
}

type Primitive = string | number | boolean | undefined

type PrimitiveArray<T = Primitive> = T extends Primitive ? T[] : never

type PromptResponse =
  | Primitive
  | PrimitiveArray
  | Record<string, unknown>
  | Record<string, unknown>[]

type ResponseMapper<T> = T extends Primitive
  ? T
  : {
      [K in keyof T]: T[K] extends infer U | symbol ? U : T[K]
    }

export function verifyPromptResponse<TResponse extends PromptResponse>(
  response: TResponse | symbol,
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
