import { describe, expect, test } from 'vitest'

import { type AnyObject, isCircular } from '../src'

function baseline_isCircular(schema: unknown) {
  try {
    JSON.stringify(schema)
    return false
  } catch {
    return true
  }
}

function createTestCases() {
  const simpleCircular: any = { name: 'root' }
  simpleCircular.self = simpleCircular

  const deepCircular: any = {
    level1: {
      level2: {
        level3: {
          data: 'deep',
        },
      },
    },
  }
  deepCircular.level1.level2.level3.back = deepCircular

  const complexCircular: any = {
    id: 1,
    name: 'complex',
    metadata: {
      tags: ['tag1', 'tag2'],
      created: new Date(),
      config: {
        enabled: true,
        options: [1, 2, 3],
      },
    },
    relations: [],
  }
  complexCircular.relations.push(complexCircular)

  const siblingA: any = { name: 'A', data: [1, 2, 3] }
  const siblingB: any = { name: 'B', data: { count: 42 } }
  siblingA.sibling = siblingB
  siblingB.sibling = siblingA

  const multiCircular: any = {
    path1: {},
    path2: {},
    shared: { value: 'shared' },
  }
  multiCircular.path1.back = multiCircular
  multiCircular.path2.back = multiCircular
  multiCircular.path1.shared = multiCircular.shared
  multiCircular.path2.shared = multiCircular.shared

  const arrayCircular: any = {
    items: [
      { id: 1, name: 'item1' },
      { id: 2, name: 'item2' },
    ],
  }
  arrayCircular.items[0].parent = arrayCircular

  return {
    nonCircular: [
      {},
      { simple: 'value' },
      { nested: { deep: { value: 42 } } },
      { array: [1, 2, { nested: 'value' }] },
      { date: new Date(), regex: /test/, func: () => {} },
      {
        complex: {
          users: [
            { id: 1, name: 'Alice', roles: ['admin'] },
            { id: 2, name: 'Bob', roles: ['user'] },
          ],
          config: {
            timeout: 5000,
            retries: 3,
            endpoints: {
              api: 'https://api.example.com',
              auth: 'https://auth.example.com',
            },
          },
        },
      },
    ],
    circular: [
      simpleCircular,
      deepCircular,
      complexCircular,
      siblingA,
      siblingB,
      multiCircular,
      arrayCircular,
    ],
    edge: [null, undefined, 42, 'string', [], [1, 2, 3]],
  }
}

function runTests(name: string, fn: (obj: AnyObject) => boolean) {
  describe(name, () => {
    const testCases = createTestCases()

    describe('should return false for non-circular objects', () => {
      testCases.nonCircular.forEach((obj, index) => {
        test(`non-circular case ${index + 1}`, () => {
          expect(fn(obj)).toBe(false)
        })
      })
    })

    describe('should return true for circular objects', () => {
      testCases.circular.forEach((obj, index) => {
        test(`circular case ${index + 1}`, () => {
          expect(fn(obj)).toBe(true)
        })
      })
    })

    describe('should handle edge cases', () => {
      test('null', () => {
        expect(fn(null)).toBe(false)
      })

      test('undefined', () => {
        expect(fn(undefined)).toBe(false)
      })

      test('primitive number', () => {
        expect(fn(42 as unknown as AnyObject)).toBe(false)
      })

      test('primitive string', () => {
        expect(fn('string' as unknown as AnyObject)).toBe(false)
      })

      test('empty array', () => {
        expect(fn([])).toBe(false)
      })

      test('array with primitives', () => {
        expect(fn([1, 2, 3])).toBe(false)
      })

      test('empty object', () => {
        expect(fn({})).toBe(false)
      })
    })

    describe('complex scenarios', () => {
      test('object with same reference in multiple places (is not circular)', () => {
        const shared = { value: 'shared' }
        const obj = {
          ref1: shared,
          ref2: shared,
          different: { value: 'different' },
        }
        expect(fn(obj)).toBe(false)
      })

      test('deeply nested with circular reference at bottom', () => {
        const obj: any = {
          a: { b: { c: { d: { e: { f: {} } } } } },
        }
        obj.a.b.c.d.e.f.root = obj
        expect(fn(obj)).toBe(true)
      })

      test('circular reference in array element', () => {
        const obj: any = {
          data: [{ id: 1 }, { id: 2, items: [] }],
        }
        obj.data[1].items.push(obj)
        expect(fn(obj)).toBe(true)
      })

      test('multiple objects with cross-references', () => {
        const objA: any = { name: 'A', refs: [] }
        const objB: any = { name: 'B', refs: [] }
        const objC: any = { name: 'C', refs: [] }

        objA.refs.push(objB)
        objB.refs.push(objC)
        objC.refs.push(objA)

        expect(fn(objA)).toBe(true)
      })
    })
  })
}

runTests('isCircular', isCircular)
runTests('isCircular with JSON.stringify', baseline_isCircular)
