type ObjectEntries<T extends object> = UnionToTuple<
  {
    [K in keyof T]-?: [K, T[K] extends infer U | undefined ? U : T[K]]
  }[keyof T]
>

export function objectEntries<const TObj extends object>(
  obj: TObj,
): ObjectEntries<TObj> {
  return Object.entries(obj) as ObjectEntries<TObj>
}

export function objectKeys<const TObj extends object>(
  obj: TObj,
): (keyof TObj)[] {
  return Object.keys(obj) as (keyof TObj)[]
}

export function objectValues<const TObj extends object>(
  obj: TObj,
): TObj[keyof TObj][] {
  return Object.values(obj) as TObj[keyof TObj][]
}

type MergeObjects<T, K = T> = T extends [infer F, ...infer R]
  ? F & MergeObjects<R, F>
  : K

export function mergeObjects<T extends Record<string, unknown>[]>(
  ...[first, ...rest]: T
): MergeObjects<T> {
  return Object.assign(first, ...rest)
}

export function convertToJSON(keyValueList: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const item of keyValueList) {
    const [keys, value] = item.split('=')
    const nestedKeys = keys.split('.')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentObject: any = result

    for (let i = 0; i < nestedKeys.length - 1; i++) {
      const key = nestedKeys[i]
      currentObject[key] = currentObject[key] || {}
      currentObject = currentObject[key]
    }

    currentObject[nestedKeys.at(-1) ?? 0] = parseValue(value)
  }

  return result
}

export function parseValue(value: string): unknown {
  if (!value) {
    return value
  } else if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else if (!Number.isNaN(Number(value))) {
    return Number.parseFloat(value)
  } else if (/^\[.*?]$/i.test(value)) {
    return value
      .slice(1, -1)
      .split(',')
      .filter(Boolean)
      .map(v => parseValue(v))
  } else if (/^{.*?}$/i.test(value)) {
    return JSON.parse(value)
  }

  return value.replace('+', ' ').replaceAll(/(?:^["'])|(?:["']$)/g, '')
}
