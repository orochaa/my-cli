/* eslint-disable no-secrets/no-secrets */
import type { App } from '@/main/app.js'
import { InvalidParamError } from '@/utils/errors.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import * as p from '@clack/prompts'

const specials = '!@#$%&_?.'
const lowercase = 'abcdefghijklmnopqrstuvwxyz'
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const numbers = '0123456789'
const all = specials + lowercase + uppercase + numbers

async function passwordCommand(params: string[]): Promise<void> {
  let passwordLength: number

  if (params.length > 0) {
    const length = Number(params[0])
    const error = verifyPasswordLength(length)

    if (error) {
      throw error
    }
    passwordLength = length
  } else {
    passwordLength = await passwordPrompt()
  }

  let password = ''

  while (password.length < passwordLength) {
    password += pick(specials, 1)
    password += pick(lowercase, 1)
    password += pick(uppercase, 1)
    password += pick(all, 3, 10)
  }

  p.outro(shuffle(password.slice(0, Math.max(0, passwordLength))))
}

async function passwordPrompt(): Promise<number> {
  const response = await p.text({
    message: 'What is your desired password length?',
    validate: res => {
      const error = verifyPasswordLength(Number(res))

      if (error) {
        return error.message
      }
    },
  })
  verifyPromptResponse(response)

  return Number(response)
}

function verifyPasswordLength(length: number): Error | null {
  if (Number.isNaN(length) || length < 8) {
    return new InvalidParamError('passwordLength', 'min length is 8')
  } else if (length > 100) {
    return new InvalidParamError('passwordLength', 'max length is 100')
  }

  return null
}

function pick(str: string, min: number, max?: number): string {
  let chars: string = ''
  const n: number = max
    ? min + Math.floor(Math.random() * (max - min + 1))
    : min

  for (let i = 0; i < n; i++) {
    chars += str.charAt(Math.floor(Math.random() * str.length))
  }

  return chars
}

function shuffle(str: string): string {
  const array: string[] = [...str]
  let tmp: string
  let current: number
  let top: number = array.length

  if (top) {
    while (--top) {
      current = Math.floor(Math.random() * (top + 1))
      tmp = array[current]
      array[current] = array[top]
      array[top] = tmp
    }
  }

  return array.join('')
}

export function passwordRecord(app: App): void {
  app.register({
    name: 'password',
    alias: 'pass',
    params: ['<length>'],
    description: 'Generate a random and safe password with the given length',
    example: 'my pass 30',
    action: passwordCommand,
  })
}
