import { type App } from '@/main/app.js'
import { isSilent } from '@/utils/cmd.js'
import { InvalidParamError, MissingParamError } from '@/utils/errors.js'
import { convertToJSON } from '@/utils/mappers.js'
import axios from 'axios'

type Method = 'get' | 'post' | 'put' | 'delete'

type Http = Record<
  Method,
  (
    url: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
  ) => Promise<unknown>
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
  const result = await http[method](url, headers, body)

  if (!isSilent() && result) {
    console.log(result)
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
  return bodyParams.length ? convertToJSON(bodyParams) : {}
}

function getHeaders(params: string[]): Record<string, string> {
  return (
    params.length ? convertToJSON(params.map(p => p.replace(/^h\./, ''))) : {}
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
    async get(url, headers) {
      return await a.get(url, { headers }).then(({ data }) => data)
    },
    async post(url, headers, body) {
      return await a.post(url, body, { headers }).then(({ data }) => data)
    },
    async put(url, headers, body) {
      return await a.put(url, body, { headers }).then(({ data }) => data)
    },
    async delete(url, headers) {
      return await a.delete(url, { headers }).then(({ data }) => data)
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
