export type Command = 'remove'

export type PromptOption<Value> = {
  value: Value
  label: string
  hint?: string
}
