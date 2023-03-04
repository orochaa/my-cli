type ObjectEntries<T extends Record<string, any>> = UnionToTuple<
  {
    [K in keyof T]-?: [K, T[K] extends infer U | undefined ? U : T[K]]
  }[keyof T]
>

export function objectEntries<TObj extends Record<string, string>>(
  obj: TObj
): ObjectEntries<TObj> {
  return Object.entries(obj) as ObjectEntries<TObj>
}

export function objectKeys<TObj extends Record<string, any>>(
  obj: TObj
): Array<keyof TObj> {
  return Object.keys(obj)
}

export function mergeObjects<TObj extends Record<string, string>>(
  ...data: TObj[]
): TObj {
  const result = data.shift() as TObj
  data
    .map(obj => objectEntries<Record<string, any>>(obj))
    .flat()
    .forEach(([key, value]) => {
      result[key as keyof TObj] = value
    })
  return result
}
