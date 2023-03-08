type ObjectEntries<T extends Record<string, any>> = UnionToTuple<
  {
    [K in keyof T]-?: [K, T[K] extends infer U | undefined ? U : T[K]]
  }[keyof T]
>

export function objectEntries<TObj extends object>(
  obj: TObj
): ObjectEntries<TObj> {
  return Object.entries(obj) as ObjectEntries<TObj>
}

export function objectKeys<TObj extends object>(obj: TObj): Array<keyof TObj> {
  return Object.keys(obj) as Array<keyof TObj>
}

export function objectValues<TObj extends object>(
  obj: TObj
): Array<TObj[keyof TObj]> {
  return Object.values(obj) as Array<TObj[keyof TObj]>
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
