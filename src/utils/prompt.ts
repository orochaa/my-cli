export function verifyPromptResponse<T>(
  response: T | symbol
): asserts response is T {
  if (!response || typeof response === 'symbol') {
    process.exit(0)
  }
}

export function hasParams(): boolean {
  return process.argv.length > 3
}

export function getParams(): string[] {
  return process.argv.slice(3)
}
