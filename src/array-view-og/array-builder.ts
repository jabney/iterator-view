import { normalizeEnd, normalizeStart } from '../lib/normalize'
import { ValueFn, range } from './iterator'

export type ArrayBuilder<T> = <U>(fn: ValueFn<T, U>) => U[]
export type ArrayBuilderAsync<T> = <U>(fn: ValueFn<T, Promise<U>>) => Promise<U[]>

export function arrayBuilder<T, V>(array: readonly T[], start: number, end: number): ArrayBuilder<T> {
    start = normalizeStart(array.length, start)
    end = normalizeEnd(array.length, end)

    return <U>(fn: ValueFn<T, U>) => {
        const list: U[] = []
        for (const i of range(start, end)) {
            list.push(fn(array[i], i))
        }
        return list
    }
}

export function arrayBuilderAsync<T, V>(array: readonly T[], start: number, end: number): ArrayBuilderAsync<T> {
    start = normalizeStart(array.length, start)
    end = normalizeEnd(array.length, end)

    return async <U>(fn: ValueFn<T, Promise<U>>) => {
        const list: U[] = []
        for (const i of range(start, end)) {
            list.push(await fn(array[i], i))
        }
        return list
    }
}
