import { excluded } from './exclusions'
import { ArrayView } from './types'

const get = <T>(array: readonly T[], start: number, end: number, i: number): T | undefined => {
    const index = start + i
    if (index < start || index >= end) {
        return undefined
    }
    return array[index]
}

const createIsNumeric = () => {
    const reNumeric = /\d+/
    return function isNumeric(value: string | symbol): value is string {
        return typeof value == 'string' && reNumeric.test(value)
    }
}

export function createProxy<T>(view: ArrayView<T>, array: readonly T[], start: number, end: number): ArrayView<T> {
    const isNumeric = createIsNumeric()

    return new Proxy(view, {
        get(target, prop, receiver) {
            if (isNumeric(prop)) {
                return get(array, start, end, parseInt(prop))
            }
            if (excluded.has(prop)) {
                throw new Error('not supported')
            } else {
                return Reflect.get(view, prop)
            }
        },
    })
}
