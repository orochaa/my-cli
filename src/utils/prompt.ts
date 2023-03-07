import { objectKeys } from './mappers'

export type PromptOption<TValue, TLabel extends string = string> = {
  value: TValue
  label: TLabel
  hint?: string
}

type Primitive = string | number | boolean

type PromptResponse<T> = T extends Primitive
  ? T
  : {
      [K in keyof T]: T[K] extends infer U | symbol ? U : T[K]
    }

function verifySymbol<T>(
  data: T | symbol
): asserts data is T {
  if (!data || typeof data === 'symbol') {
    process.exit(0)
  }
}

export function verifyPromptResponse<
  T extends Primitive | Record<string, unknown>
>(response: T | symbol): asserts response is Prettify<T & PromptResponse<T>> {
  if (typeof response === 'object') {
    for (const key of objectKeys(response)) {
      verifySymbol(response[key])
    }
  } else {
    verifySymbol(response)
  }
}
