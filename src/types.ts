export type Command = 'remove' | 'store' | 'recover'

export type LockData = Record<string, string>

export type PromptOption<TValue, TLabel extends string = string> = {
  value: TValue
  label: string
  hint?: string
}
