import { IArrayView } from './types'

const get = <T>(array: readonly T[], start: number, end: number, i: number): T | undefined => {
    const index = start + i
    if (index < start || index >= end) {
        return undefined
    }
    return array[index]
}

const isNumeric = (value: string | symbol): value is string => {
    return typeof value == 'string' && /^\d+$/.test(value)
}

export function createProxy<T>(view: IArrayView<T>, array: readonly T[], start: number, end: number): IArrayView<T> {
    return new Proxy(view, {
        get(target, prop, receiver) {
            if (isNumeric(prop)) {
                return get(array, start, end, parseInt(prop))
            } else {
                return Reflect.get(view, prop)
            }
        },
    })
}
