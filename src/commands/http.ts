import { App } from '@/main/app'
import { errorHandler, isSilent } from '@/utils/cmd'
import { InvalidParamError } from '@/utils/errors'
import axios from 'axios'

type Method = 'get' | 'post' | 'put' | 'delete'

type Http = Record<
  Method,
  (
    url: string,
    headers: Record<string, string>,
    body: string
  ) => Promise<unknown>
>

async function httpCommand(params: string[]): Promise<void> {
  const [method, urlParams] = getMethod(params)
  const [url, bodyHeadersParams] = getUrl(urlParams)
  const body = getBody(bodyHeadersParams)
  const headers = getHeaders(bodyHeadersParams)

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
  let url: string = params[0]
  const rest = params.slice(1)
  if (url.startsWith('/')) {
    url = `http://localhost:3000${url}`
  } else if (url.startsWith(':')) {
    url = `http://localhost${url}`
  } else if (!/https?:\/\//.test(url)) {
    errorHandler(new InvalidParamError('request'))
  }
  return [url, rest]
}

function getBody(params: string[]): string {
  if (!params[0]) {
    return '{}'
  }
  const bodyParams = params.filter(p => !/^h\./.test(p))
  return JSON.stringify(convertToJSON(bodyParams))
}

function getHeaders(params: string[]): Record<string, string> {
  if (!params[0]) {
    return {}
  }
  const headerParams = params
    .filter(p => p.startsWith('h.'))
    .map(p => p.replace(/^h\./, ''))
  return convertToJSON(headerParams) as Record<string, string>
}

function convertToJSON(keyValueList: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (let item of keyValueList) {
    const [keys, value] = item.split('=')
    const nestedKeys = keys.split('.')

    let currentObject: any = result

    for (let i = 0; i < nestedKeys.length - 1; i++) {
      const key = nestedKeys[i]
      currentObject[key] = currentObject[key] || {}
      currentObject = currentObject[key]
    }

    currentObject[nestedKeys[nestedKeys.length - 1]] = parseValue(value)
  }

  return result
}

function parseValue(value: any): unknown {
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else if (!isNaN(value)) {
    return parseFloat(value)
  } else {
    return value.replace('+', ' ')
  }
}

function createHttp(): Http {
  const a = axios.create({
    validateStatus: () => true
  })

  return {
    async get(url, headers) {
      const { data } = await a.get(url, { headers })
      return data
    },
    async post(url, headers, body) {
      const { data } = await a.post(url, body, { headers })
      return data
    },
    async put(url, headers, body) {
      const { data } = await a.put(url, body, { headers })
      return data
    },
    async delete(url, headers) {
      const { data } = await a.delete(url, { headers })
      return data
    }
  }
}

export function httpRecord(app: App): void {
  app.register({
    name: 'http',
    alias: null,
    params: ['<method?> <url> <body?> <headers?>'],
    description: 'Make an http request',
    example:
      'my http post /user key1=1 key2.subset1=true key2.subset2=3.14 key3=Hello+World',
    action: httpCommand
  })
}
