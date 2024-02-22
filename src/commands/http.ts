import { type App } from '@/main/app.js'
import { isSilent } from '@/utils/cmd.js'
import { InvalidParamError, MissingParamError } from '@/utils/errors.js'
import { convertToJSON } from '@/utils/mappers.js'
import axios, { type AxiosResponse } from 'axios'
import color from 'picocolors'
import { log, outro } from '@clack/prompts'

type Method = 'get' | 'post' | 'put' | 'delete'

type Http = Record<
  Method,
  (
    url: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ) => Promise<AxiosResponse<unknown>>
>

async function httpCommand(params: string[]): Promise<void> {
  if (params.length === 0) {
    throw new MissingParamError('params')
  }

  const [method, urlParams] = getMethod(params)
  const [url, bodyAndHeadersParams] = getUrl(urlParams)
  const [bodyParams, headerParams] =
    splitBodyAndHeaderParams(bodyAndHeadersParams)
  const body = getBody(bodyParams)
  const headers = getHeaders(headerParams)

  const http = createHttp()
  const { status, data } = await http[method](url, headers, body)

  if (!isSilent()) {
    const statusLabel = color.cyan('"StatusCode"')
    const bodyLabel = color.cyan('"Body"')

    const statusMessage = `${statusLabel}: ${status}`
    status < 400 ? log.success(statusMessage) : log.error(statusMessage)

    if (data) {
      const jsonLines = JSON.stringify(data, null, 2).split(/\n/g)

      log.message(`${bodyLabel}: ${jsonLines[0]}`)

      for (let i = 1; i < jsonLines.length; i++) {
        process.stdout.moveCursor(0, -1)
        log.message(
          jsonLines[i].replace(/^(.*?)(".+?")/, `$1${color.cyan('$2')}`),
        )
      }
    } else {
      log.message(`${bodyLabel}: No Content`)
    }
    process.stdout.moveCursor(0, -1)
    outro()
  }
}

function getMethod(params: string[]): [Method, string[]] {
  const methods: Method[] = ['get', 'post', 'put', 'delete']
  const param = params[0].toLowerCase()

  if (methods.includes(param)) {
    return [param as Method, params.slice(1)]
  }

  return ['get', params]
}

function getUrl(params: string[]): [string, string[]] {
  const rest = params.slice(1)

  const firstParam = params[0]

  if (firstParam.startsWith('/')) {
    return [`http://localhost:3000${firstParam}`, rest]
  }

  if (firstParam.startsWith(':')) {
    return [`http://localhost${firstParam}`, rest]
  }

  if (firstParam.startsWith('http')) {
    return [firstParam, rest]
  }

  throw new InvalidParamError('url')
}

function getBody(bodyParams: string[]): Record<string, unknown> {
  return bodyParams.length > 0 ? convertToJSON(bodyParams) : {}
}

function getHeaders(params: string[]): Record<string, string> {
  return (
    params.length > 0
      ? convertToJSON(params.map(p => p.replace(/^h\./, '')))
      : {}
  ) as Record<string, string>
}

function splitBodyAndHeaderParams(params: string[]): [string[], string[]] {
  const bodyParams: string[] = []
  const headersParams: string[] = []

  for (const param of params) {
    if (param.startsWith('h.')) {
      headersParams.push(param)
    } else {
      bodyParams.push(param)
    }
  }

  return [bodyParams, headersParams]
}

function createHttp(): Http {
  const a = axios.create({
    validateStatus: () => true,
  })

  return {
    async get(url, headers): Promise<AxiosResponse> {
      return a.get(url, { headers })
    },
    async post(url, headers, body): Promise<AxiosResponse> {
      return a.post(url, body, { headers })
    },
    async put(url, headers, body): Promise<AxiosResponse> {
      return a.put(url, body, { headers })
    },
    async delete(url, headers): Promise<AxiosResponse> {
      return a.delete(url, { headers })
    },
  }
}

export function httpRecord(app: App): void {
  app.register({
    name: 'http',
    alias: null,
    params: ['<method?> <url> <body?> <headers?>'],
    description: 'Make an http request',
    example:
      'my http post /user key1=1 key2.subset1=true key2.subset2=3.14 key3=Hello+World h.authorization=token',
    action: httpCommand,
  })
}
