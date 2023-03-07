import { objectKeys } from './mappers'

export type PromptOption<TValue, TLabel extends string = string> = {
  value: TValue
  label: TLabel
  hint?: string
}

type Primitive = string | number | boolean

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
  const dataType = typeof data
  if (dataType === 'undefined' || dataType === 'symbol') {
    process.exit(0)
  }
}
