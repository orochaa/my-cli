import { errorHandler, exec, getParams, hasParams } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import { readLockfile } from '@/utils/file-system'
import { verifyPromptResponse } from '@/utils/prompt'
import { exhaustive } from 'exhaustive'
import * as p from '@clack/prompts'

export async function cloneCommand(): Promise<void> {
  const base = 'https://github.com'
  const owner = readLockfile().git

  let clone: [owner: string, repository: string, dir: string]

  if (hasParams()) {
    const params = getParams()
    clone = exhaustive(String(params.length), {
      '1': () => [owner, params[0], params[0]] as const,
      '2': () => [owner, params[0], params[1]] as const,
      '3': () => [params[0], params[1], params[2]] as const,
      _: () => errorHandler(new InvalidParamError('owner or repository or dir'))
    })
  } else {
    clone = await clonePrompt()
  }

  exec(`git clone ${base}/${clone[0]}/${clone[1]}.git ${clone[2]}`)
  exec(`cd ${clone[2]} && git remote rename origin o`)
}

async function clonePrompt(): Promise<[string, string, string]> {
  const response = await p.group({
    owner: () =>
      p.text({
        message: 'Type the repository owner:',
        initialValue: 'Mist3rBru',
        validate: res => {
          if (res.length < 2) return 'invalid name'
        }
      }),
    repo: () =>
      p.text({
        message: 'Type the repository name:',
        validate: res => {
          if (res.length < 2) return 'invalid name'
        }
      }),
    dir: ({ results }) =>
      p.text({
        message: 'Type the target directory:',
        initialValue: results.repo as string,
        validate: res => {
          if (res.length < 2) return 'invalid name'
        }
      })
  })
  verifyPromptResponse(response)
  if (typeof response.dir !== 'string') {
    return [response.owner, response.repo, response.repo]
  }
  return [response.owner, response.repo, response.dir]
}
