type ObjectEntries<T extends Record<string, any>> = UnionToTuple<
  {
    [K in keyof T]-?: [K, T[K] extends infer U | undefined ? U : T[K]]
  }[keyof T]
>

export function objectEntries<const TObj extends object>(
  obj: TObj
): ObjectEntries<TObj> {
  return Object.entries(obj) as ObjectEntries<TObj>
}

export function objectKeys<const TObj extends object>(
  obj: TObj
): Array<keyof TObj> {
  return Object.keys(obj) as Array<keyof TObj>
}

export function objectValues<const TObj extends object>(
  obj: TObj
): Array<TObj[keyof TObj]> {
  return Object.values(obj) as Array<TObj[keyof TObj]>
}

type MergeObjects<T, K = T> = T extends [infer F, ...infer R]
  ? F & MergeObjects<R, F>
  : K

export function mergeObjects<T extends Record<string, unknown>[]>(
  ...data: T
): MergeObjects<T> {
  const result = data.shift() as T[0]
  data
    .map(obj => objectEntries<Record<string, any>>(obj))
    .flat()
    .forEach(([key, value]) => {
      result[key as keyof T[0]] = value
    })
  return result as MergeObjects<T>
}

export function convertToJSON(keyValueList: string[]): Record<string, unknown> {
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
