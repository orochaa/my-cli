import {
  convertToJSON,
  mergeObjects,
  objectEntries,
  objectKeys,
  objectValues,
  parseValue,
} from '@/utils/mappers.js'

describe('mappers', () => {
  describe('objectEntries()', () => {
    it('should return object entries', () => {
      const mock = {
        foo: 1,
        bar: '2',
      } as const
      const result = objectEntries(mock)
      const expected: typeof result = [
        ['foo', 1],
        ['bar', '2'],
      ]
      expect(result).toStrictEqual(expected)
    })
  })

  describe('objectKeys()', () => {
    it('should return object keys', () => {
      const mock = {
        foo: 1,
        bar: '2',
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
        bar: '2',
      } as const
      const result = objectValues(mock)
      const expected: typeof result = [1, '2']
      expect(result).toStrictEqual(expected)
    })
  })

  describe('mergeObjects()', () => {
    it('should return a merged object', () => {
      const foo = { foo: 1 }
      const bar = { bar: '2' }
      const baz = { baz: null }
      const result = mergeObjects(foo, bar, baz)
      const expected: typeof result = {
        foo: 1,
        bar: '2',
        baz: null,
      }
      expect(result).toStrictEqual(expected)
      expect(foo).toStrictEqual(expected)
    })
  })

  describe('convertToJSON()', () => {
    it('should return a JSON with given params', () => {
      const params = [
        'key1=1',
        'key2.subset1=true',
        'key2.subset2=3.14',
        'key3=Hello+World',
        'key4.subset1.subset1_1=["1",1,false]',
        "key4.subset1.subset1_2=let's+go",
      ]
      const expected = {
        key1: 1,
        key2: {
          subset1: true,
          subset2: 3.14,
        },
        key3: 'Hello World',
        key4: {
          subset1: {
            subset1_1: ['1', 1, false],
            subset1_2: "let's go",
          },
        },
      }

      const result = convertToJSON(params)

      expect(result).toStrictEqual(expected)
    })
  })

  describe('parseValue()', () => {
    it('should parse values to their respective type', () => {
      const usecases: Array<[string, unknown]> = [
        ['1', 1],
        ['"1"', '1'],
        ['1.3', 1.3],
        ['"1.3"', '1.3'],
        ['[]', []],
        ['[1,false,"3"]', [1, false, '3']],
        ['{}', {}],
        ['{"key":"value"}', { key: 'value' }],
        ['true', true],
        ['false', false],
        ['"true"', 'true'],
        ['"false"', 'false'],
        ['Hello+Wold', 'Hello Wold'],
        ["Let's go", "Let's go"],
      ]
      expect.assertions(usecases.length)
      for (const [param, expected] of usecases) {
        expect(parseValue(param)).toStrictEqual(expected)
      }
    })
  })
})
