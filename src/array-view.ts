import { augment } from './augment'
import { arrayIterator } from './iterator'
import { createProxy } from './proxy'
import { ArrayView } from './types'

/**
 * Creates a view over an array.
 */
export function arrayView<T>(array: readonly T[], start = 0, end = array.length): ArrayView<T> {
    const self: ArrayView<T> = augment(array, Object.create(array), start, end, arrayView)

    Object.defineProperties(self, {
        length: {
            get() {
                return end - start
            },
            set(value: number) {
                throw new Error('property is read only')
            },
        },
    })

    self[Symbol.iterator] = () => {
        return arrayIterator(array, start, end)
    }

    return createProxy(self, array, start, end)
}
