function emphasize(str: string): string {
  return str.split(' ').length > 1 ? str : `'${str}'`
}

export class NotFoundError extends Error {
  constructor(item: string) {
    super(`${emphasize(item)} not found 🙁`)
    this.name = 'NotFoundError'
  }
}

export class InvalidParamError extends Error {
  constructor(param: string, reason?: string) {
    super(`${emphasize(param)} is invalid. ${reason ?? ''}`)
    this.name = 'InvalidParamError'
  }
}
