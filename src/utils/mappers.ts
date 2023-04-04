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
