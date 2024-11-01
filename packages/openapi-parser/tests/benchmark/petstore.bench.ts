import { bench, describe, expect } from 'vitest'

import specification from './examples/petstore.json'
import { resolveNew } from './utils/resolveNew.js'
import { resolveOld } from './utils/resolveOld.js'

describe('petstore', () => {
  bench('@apidevtools/swagger-parser', async () => {
    // Action!
    await resolveOld(specification)
  })

  bench('@mintlify/openapi-parser', async () => {
    // Action!
    await resolveNew(specification)
  })
})
