import microdiff, { type Difference } from 'microdiff'

/**
 * This will go through the diff and combine any diff items which are next to eachother which go from remove to add.
 * - first we check if the payloads are the same then it was just a simple rename
 * - next we will add the rename and also handle any changes in the diff
 */
export const combineRenameDiffs = (
  diff: Difference[],
  pathPrefix: string[] = [],
): Difference[] => {
  const combined: Difference[] = []
  let skipNext = false

  for (let i = 0; i < diff.length; i++) {
    if (skipNext) {
      skipNext = false
      continue
    }

    const current = diff[i]
    const next = diff[i + 1]

    // Prefix the paths when nested
    if (pathPrefix.length) {
      current.path.unshift(...pathPrefix)
      if (next) next.path.unshift(...pathPrefix)
    }
    // Only mutate paths
    else if (current.path[0] !== 'paths') {
      combined.push(current)
      continue
    }

    if (current.type === 'REMOVE' && next?.type === 'CREATE') {
      const [, currPath, currMethod] = current.path as string[]
      const [, nextPath, nextMethod] = next.path as string[]
      const nestedPrefix = ['paths', nextPath]

      // Handle path rename
      if (currPath !== nextPath) {
        combined.push({
          type: 'CHANGE',
          path: ['paths', 'path'],
          oldValue: currPath,
          value: nextPath,
        })
      }

      // Handle method rename
      if (currMethod && nextMethod && currMethod !== nextMethod) {
        combined.push({
          type: 'CHANGE',
          path: ['paths', nextPath, 'method'],
          oldValue: currMethod,
          value: nextMethod,
        })
        nestedPrefix.push(nextMethod)
      }

      // Only go one level deep
      if (pathPrefix.length === 0) {
        // Handle other changes within the renamed path or method
        const innerDiff = microdiff(current.oldValue, next.value)
        if (innerDiff.length) {
          const innerCombined = combineRenameDiffs(innerDiff, nestedPrefix)
          combined.push(...innerCombined)
        }
      }

      skipNext = true
    } else {
      combined.push(current)
    }
  }

  return combined
}
