import { describe, expect, it } from 'vitest'

import { validate } from './index.js'

describe('validate', async () => {
  it('fails on invalid schema', async () => {
    const result = await validate('')

    expect(result.valid).toBe(false)
    expect(result.errors).toMatchObject([
      {
        message: 'Can’t find JSON, YAML or filename in data',
      },
    ])
  })

  it('returns errors for an invalid schema', async () => {
    const result = await validate(
      `{
        "openapi": "3.1.0",
        "paths": {}
      }`,
    )

    expect(result.valid).toBe(false)

    expect(result.errors).toBeTypeOf('object')
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0]).toMatchObject({
      message: "must have required property 'info'",
    })
  })

  it('returns errors for an invalid specification', async () => {
    const result = await validate('pineapples')

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toBe(
      'Can’t find supported Swagger/OpenAPI version in specification, version must be a string.',
    )
  })

  it('works with YAML', async () => {
    const result = await validate(`openapi: 3.1.0
info:
  title: Hello World
  version: 1.0.0
paths: {}
`)

    expect(result.schema.info.title).toBe('Hello World')
  })

  it('doesn’t work with OpenAPI 4.0.0', async () => {
    const result = await validate(`{
      "openapi": "4.0.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain(
      'Can’t find supported Swagger/OpenAPI version in specification',
    )
  })

  it('throws an error', async () => {
    expect(async () => {
      await validate(undefined, {
        throwOnError: true,
      })
    }).rejects.toThrowError('Can’t find JSON, YAML or filename in data')
  })

  it('validates an OpenAPI 3.2 document with query and additional operations', async () => {
    const result = await validate({
      openapi: '3.2.0',
      $self: 'https://api.example.com/openapi.yaml',
      info: { title: 'Plants', version: '1.0.0' },
      paths: {
        '/plants': {
          query: {
            requestBody: {
              content: {
                'application/jsonl': { itemSchema: { type: 'object' } },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
          additionalOperations: {
            PURGE: { responses: { '204': { description: 'Purged' } } },
          },
        },
      },
    })

    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.2')
  })

  it('reports OpenAPI 3.2 schema errors at their path', async () => {
    const result = await validate({
      openapi: '3.2.0',
      info: { title: 1, version: '1.0.0' },
      paths: {},
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toMatchObject([
      { path: '/info/title', message: 'type must be string' },
    ])
  })

  it('accepts a referenced 3.2 path item that carries sibling operations', async () => {
    const result = await validate({
      openapi: '3.2.0',
      info: { title: 'Plants', version: '1.0.0' },
      paths: {
        '/plants': {
          $ref: '#/components/pathItems/Plants',
          post: { responses: { '201': { description: 'Created' } } },
        },
      },
      components: {
        pathItems: {
          Plants: { get: { responses: { '200': { description: 'OK' } } } },
        },
      },
    })

    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })
})
