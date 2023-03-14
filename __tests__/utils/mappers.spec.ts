import {
  mergeObjects,
  objectEntries,
  objectKeys,
  objectValues
} from '@/utils/mappers'

describe('mappers', () => {
  describe('objectEntries()', () => {
    it('should return object entries', () => {
      const mock = {
        foo: 1,
        bar: '2'
      } as const
      const result = objectEntries(mock)
      const expected: typeof result = [
        ['foo', 1],
        ['bar', '2']
      ]
      expect(result).toStrictEqual(expected)
    })
  })

  describe('objectKeys()', () => {
    it('should return object keys', () => {
      const mock = {
        foo: 1,
        bar: '2'
      } as const
      const result = objectKeys(mock)
      const expected: typeof result = ['foo', 'bar']
      expect(result).toStrictEqual(expected)
    })
  })

  describe('objectValues()', () => {
    it('should return object values', () => {
      const mock = {
        foo: 1,
        bar: '2'
      } as const
      const result = objectValues(mock)
      const expected: typeof result = [1, '2']
      expect(result).toStrictEqual(expected)
    })
  })

  describe('mergeObjects()', () => {
    it('should return a merged object', () => {
      const foo = { foo: 1 } as const
      const bar = { bar: '2' } as const
      const baz = { baz: null } as const
      const result = mergeObjects(foo, bar, baz)
      const expected: typeof result = {
        foo: 1,
        bar: '2',
        baz: null
      }
      expect(result).toStrictEqual(expected)
      expect(foo).toStrictEqual(expected)
    })
  })
})
