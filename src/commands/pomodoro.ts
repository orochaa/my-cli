import { errorHandler, getParams, hasParams } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import { verifyPromptResponse } from '@/utils/prompt'
import * as p from '@clack/prompts'

type PomodoroPeriod = 'work' | 'rest'

type PomodoroController = Record<PomodoroPeriod, number> & {
  period: PomodoroPeriod
}

export async function pomodoroCommand(): Promise<void> {
  const controller: PomodoroController = {
    work: 0,
    rest: 0,
    period: 'work'
  }

  if (hasParams()) {
    const params = getParams().map(Number)
    for (let i = 0; i < 2; i++) {
      const error = verifyPeriod(params[i])
      if (error) {
        return errorHandler(error)
      }
    }
    controller.work = params[0]
    controller.rest = params[1]
  } else {
    const params = await setupPomodoroPrompt()
    controller.work = params[0]
    controller.rest = params[1]
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

    console.clear()
    const intervalId = setInterval(() => {
      const currentTime = new Date()
        .toISOString()
        .replace(/.+?T(.{5}).+/i, '$1')
        .split(':')
        .map(Number)
        .map((n, i) => {
          const isHour = i === 0
          if (!isHour) return n

          const isPastMidnight = n - 3 < 0
          const localeHour = isPastMidnight ? n + 21 : n - 3
          return localeHour
        })
        .map(n => String(n).padStart(2, '0'))
        .join(':')

      const remainingTime = `${parseTime(min)}:${parseTime(seg)}`

      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(`${period} | ${remainingTime} | ${currentTime}`)

      if (min === 0 && seg === 0) {
        clearInterval(intervalId)
        process.stdout.write('\n')
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
