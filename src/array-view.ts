import { augment } from './augment'
import { arrayIterator } from './iterator'
import { normalizeEnd, normalizeStart } from './normalize'
import { createProxy } from './proxy'
import { ArrayView } from './types'

/**
 * Creates a view over an array.
 */
export function arrayView<T>(array: readonly T[], start?: number, end?: number): ArrayView<T> {
    const _start = normalizeStart(array.length, start ?? 0)
    const _end = normalizeEnd(array.length, end ?? array.length)

    const self: ArrayView<T> = augment(array, Object.create(array), _start, _end, arrayView)

    Object.defineProperties(self, {
        length: {
            get() {
                return _end - _start
            },
            set(value: number) {
                throw new Error('property is read only')
            },
        },
    })

    self[Symbol.iterator] = () => {
        return arrayIterator(array, _start, _end)
    }

    return createProxy(self, array, _start, _end)
}
