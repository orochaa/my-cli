import { App } from '@/main/app.js'
import { InvalidParamError, MissingParamError } from '@/utils/errors.js'
import { verifyPromptResponse } from '@/utils/prompt.js'
import colors from 'picocolors'
import { block } from '@clack/core'
import * as p from '@clack/prompts'

type Period = 'work' | 'rest'

type Controller = Record<Period, number> & {
  period: Period
}

async function pomodoroCommand(params: string[]): Promise<void> {
  const controller = await getController(params)

  let toggle: boolean
  do {
    await timer(controller.period, controller[controller.period])
    controller.period = controller.period === 'rest' ? 'work' : 'rest'
    toggle = await togglePeriodPrompt(controller.period)
  } while (toggle)
}

async function getController(params: string[]): Promise<Controller> {
  const formatController = (work: number, rest: number): Controller => {
    return { period: 'work', work, rest }
  }

  const isDefault = params.includes('d')

  if (isDefault) {
    return formatController(25, 5)
  } else if (params.length) {
    const timers = params.map(Number).filter(n => !isNaN(n))

    if (timers.length < 2) {
      throw new MissingParamError('timers')
    }

    for (let i = 0; i < 2; i++) {
      const error = verifyPeriod(timers[i])
      if (error) throw error
    }

    return formatController(timers[0], timers[1])
  } else {
    const timers = await pomodoroPrompt()
    return formatController(timers[0], timers[1])
  }
}

async function pomodoroPrompt(): Promise<[number, number]> {
  const response = await p.group({
    work: () =>
      p.text({
        message: 'What is your work period?',
        initialValue: '25',
        validate: res => {
          const error = verifyPeriod(Number(res))
          if (error) return error.message
        },
      }),
    rest: () =>
      p.text({
        message: 'What is your rest period?',
        initialValue: '5',
        validate: res => {
          const error = verifyPeriod(Number(res))
          if (error) return error.message
        },
      }),
  })
  verifyPromptResponse(response)
  return [response.work, response.rest].map(Number) as [number, number]
}

async function togglePeriodPrompt(period: Period): Promise<boolean> {
  const response = await p.confirm({
    message: `Are you ready to start your ${period} period?`,
    initialValue: true,
  })
  verifyPromptResponse(response)
  return response
}

function verifyPeriod(period: number): Error | null {
  if (isNaN(period) || period < 5) {
    return new InvalidParamError('period', 'must be 5 or higher')
  } else if (period > 90) {
    return new InvalidParamError('period', 'must be 90 or lower')
  }
  return null
}

async function timer(period: Period, min: number): Promise<void> {
  return new Promise(resolve => {
    let seg = 0
    const unblock = block()

    const exitCb = () => {
      unblock()
    }

    process.once('exit', exitCb)

    const intervalId = setInterval(() => {
      const date = new Date()
      const currentTime = concatTime(date.getHours(), date.getMinutes())
      const remainingTime = concatTime(min, seg)

      console.clear()
      process.stdout.write(display(period, remainingTime, currentTime))

      if (min === 0 && seg === 0) {
        clearInterval(intervalId)
        process.removeListener('exit', exitCb)
        process.stdout.write('\n')
        unblock()
        return resolve()
      }

      if (seg-- === 0) {
        seg = 59
        if (min - 1 >= 0) {
          min--
        }
      }
    }, 1000)
  })
}

function parseTime(time: number): string {
  return String(time).padStart(2, '0')
}

function concatTime(...time: number[]): string {
  return time.map(parseTime).join(':')
}

function display(...time: string[]): string {
  return time.join(colors.blue(' | '))
}

export function pomodoroRecord(app: App): void {
  app.register({
    name: 'pomodoro',
    alias: 'pomo',
    params: ['d', '<work> <rest>'],
    description: 'Start a pomodoro timer',
    example: 'my pomo d',
    action: pomodoroCommand,
  })
}
