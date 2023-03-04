export type Command = 'remove' | 'store'

export type PromptOption<Value> = {
  value: Value
  label: string
  hint?: string
}
