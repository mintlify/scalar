import { describe, expect, it } from 'vitest'
import { type Ref, nextTick, ref, watch } from 'vue'

import { useOpenApiDocument } from './useOpenApiDocument'

describe('useOpenApiDocument', () => {
  it('has processing state', async () => {
    const { schema, state } = useOpenApiDocument({
      openapi: '3.1.0',
    })

    expect(state.value).toBe('processing')

    await waitFor(state, 'idle')

    expect(schema.value).toStrictEqual({
      openapi: '3.1.0',
    })
  })

  it('has done state', async () => {
    const { state } = useOpenApiDocument({
      openapi: '3.1.0',
    })

    await waitFor(state, 'idle')

    expect(state.value).toBe('idle')
  })

  it('has a schema', async () => {
    const { state, schema } = useOpenApiDocument({
      openapi: '3.1.0',
    })

    await waitFor(state, 'idle')

    expect(schema.value).toStrictEqual({
      openapi: '3.1.0',
    })
  })

  it('updates the schema', async () => {
    const input = ref<string>(
      JSON.stringify({
        openapi: '3.1.0',
      }),
    )

    const { state, schema } = useOpenApiDocument(input)

    await waitFor(state, 'idle')

    expect(schema.value).toStrictEqual({
      openapi: '3.1.0',
    })

    input.value = JSON.stringify({
      swagger: '2.0',
    })

    await waitFor(state, 'idle')

    expect(schema.value).toStrictEqual({
      swagger: '2.0',
    })
  })
})

function waitFor(input: Ref<any>, expectedValue: any) {
  return new Promise<void>((resolve) => {
    const unwatch = watch(input, (newValue) => {
      if (newValue === expectedValue) {
        unwatch()
        resolve()
      }
    })
  })
}