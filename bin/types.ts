export type MyPrompt = () => Promise<void>

export type MyFunctionName = 'remove'

export type PromptOption<Value> = {
  value: Value
  label: string
  hint?: string
}
