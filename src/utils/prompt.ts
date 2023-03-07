export function verifyPromptResponse<T>(
  response: T | symbol
): asserts response is T {
  if (!response || typeof response === 'symbol') {
    process.exit(0)
  }
}
