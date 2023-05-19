import { App } from '@/main/app'
import { errorHandler } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import { block, verifyPromptResponse } from '@/utils/prompt'
import color from 'picocolors'
import * as p from '@clack/prompts'

type PomodoroPeriod = 'work' | 'rest'

type PomodoroController = Record<PomodoroPeriod, number> & {
  period: PomodoroPeriod
}

async function pomodoroCommand(params: string[]): Promise<void> {
  const controller: PomodoroController = {
    work: 25,
    rest: 5,
    period: 'work'
  }

  if (params[0] !== 'd') {
    if (params.length) {
      const times = params.map(Number)
      for (let i = 0; i < 2; i++) {
        const error = verifyPeriod(times[i])
        if (error) {
          return errorHandler(error)
        }
      }
      controller.work = times[0]
      controller.rest = times[1]
    } else {
      const params = await setupPomodoroPrompt()
      controller.work = params[0]
      controller.rest = params[1]
    }
  }

  let toggle: boolean
  do {
    await timer(controller.period, controller[controller.period])
    controller.period = controller.period === 'rest' ? 'work' : 'rest'
    toggle = await togglePeriodPrompt(controller.period)
  } while (toggle)
}

async function setupPomodoroPrompt(): Promise<[number, number]> {
  const response = await p.group({
    work: () =>
      p.text({
        message: 'What is your work period?',
        initialValue: '25',
        validate: res => {
          const error = verifyPeriod(Number(res))
          if (error) return error.message
        }
      }),
    rest: () =>
      p.text({
        message: 'What is your rest period?',
        initialValue: '5',
        validate: res => {
          const error = verifyPeriod(Number(res))
          if (error) return error.message
        }
      })
  })
  verifyPromptResponse(response)
  return [response.work, response.rest].map(Number) as [number, number]
}

async function togglePeriodPrompt(period: PomodoroPeriod): Promise<boolean> {
  const response = await p.confirm({
    message: `Are you ready to start your ${period} period?`,
    initialValue: true
  })
  verifyPromptResponse(response)
  return response
}

function verifyPeriod(period: number): Error | null {
  if (isNaN(period) || period < 5) {
    return new InvalidParamError('period', 'must be 5 or higher')
  } else if (period > 90) {
    return new InvalidParamError('period', 'must 90 or lower')
  }
  return null
}

async function timer(period: PomodoroPeriod, min: number): Promise<void> {
  return new Promise(resolve => {
    let seg = 0
    const unblock = block()

    const intervalId = setInterval(() => {
      const date = new Date()
      const currentTime = concatTime(date.getHours(), date.getMinutes())
      const remainingTime = concatTime(min, seg)

      console.clear()
      process.stdout.write(display(period, remainingTime, currentTime))

      if (min === 0 && seg === 0) {
        clearInterval(intervalId)
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
  return time.join(color.blue(' | '))
}

export function pomodoroRecord(app: App): void {
  app.register({
    name: 'pomodoro',
    alias: 'pomo',
    params: ['d', '<work> <rest>'],
    description: 'Start a pomodoro timer',
    example: 'my pomo d',
    action: pomodoroCommand
  })
}
