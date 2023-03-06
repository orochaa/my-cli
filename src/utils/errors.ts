export class NotFoundError extends Error {
  constructor(item: string) {
    super(`'${item}' not found`)
    this.name = 'NotFoundError'
  }
}

export class InvalidParamError extends Error {
  constructor(param: string, reason?: string) {
    super(`'${param}' in invalid. ${reason ?? ''}`)
    this.name = 'InvalidParamError'
  }
}
