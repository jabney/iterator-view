import { normalizeEnd, normalizeStart } from './normalize'
import { ArrayView } from './types'

type CreateView<T> = (array: readonly T[], start: number, end: number) => ArrayView<T>

export const augment = <T>(
    view: ArrayView<T>,
    array: readonly T[],
    start: number,
    end: number,
    createView: CreateView<T>
): ArrayView<T> => {
    view.at = (index: number) => {
        return array[start + normalizeStart(view.length, index)]
    }
    view.concat = (...items: (T | ConcatArray<T>)[]): T[] => {
        return array.slice(start, end).concat(...items)
    }
    view.find = (predicate: (value: T, index: number, obj: ArrayView<T>) => unknown, thisArg?: any): T | undefined => {
        for (let i = start; i < end; i++) {
            if (predicate.call(thisArg, array[i], i - start, view)) {
                return array[i]
            }
        }
    }
    view.join = (separator?: string): string => {
        return array.slice(start, end).join(separator)
    }
    view.keys = function* keys(): IterableIterator<number> {
        for (let i = start; i < end; i++) {
            yield i - start
        }
    }
    view.values = function* values(): IterableIterator<T> {
        for (let i = start; i < end; i++) {
            yield array[i]
        }
    }
    view.entries = function* entries(): IterableIterator<[number, T]> {
        for (let i = start; i < end; i++) {
            yield [i - start, array[i]]
        }
    }
    view.every = (predicate: (value: T, index: number, array: ArrayView<T>) => unknown, thisArg?: any): boolean => {
        for (let i = start; i < end; i++) {
            if (!predicate.call(thisArg, array[i], i - start, view)) {
                return false
            }
        }
        return true
    }
    view.map = <U>(callbackfn: (value: T, index: number, view: ArrayView<T>) => U, thisArg?: any): U[] => {
        const list: U[] = []
        for (let i = start; i < end; i++) {
            list.push(callbackfn.call(thisArg, array[i], i - start, view))
        }
        return list
    }
    view.mapAsync = async <U>(callbackfn: (value: T, index: number, view: ArrayView<T>) => Promise<U>, thisArg?: any): Promise<U[]> => {
        const list: U[] = []
        for (let i = start; i < end; i++) {
            let value = await callbackfn.call(thisArg, array[i], i - start, view)
            list.push(value)
        }
        return list
    }
    view.filter = <S extends T>(predicate: (value: T, index: number, array: ArrayView<T>) => value is S, thisArg?: any): S[] => {
        const list: S[] = []
        for (let i = start; i < end; i++) {
            if (predicate.call(thisArg, array[i], i - start, view) === true) {
                list.push(array[i] as S)
            }
        }
        return list
    }
    view.filterAsync = async <S extends T>(
        predicate: (value: T, index: number, array: ArrayView<T>) => Promise<boolean>,
        thisArg?: any
    ): Promise<S[]> => {
        const list: S[] = []
        for (let i = start; i < end; i++) {
            const result = await predicate.call(thisArg, array[i], i - start, view)
            if (result === true) {
                list.push(array[i] as S)
            }
        }
        return list
    }
    view.reduce = <U>(
        callbackfn: (previousValue: T | U, currentValue: T | U, currentIndex: number, array: ArrayView<T>) => U,
        initialValue?: U
    ): U => {
        const first = initialValue == null ? start + 1 : start
        let prev: T | U = initialValue == null ? array[first] : initialValue
        let curr: T | U = array[first]
        for (let i = first; i < end; i++) {
            const result = callbackfn(prev, curr, i - first, view)
            prev = curr
            curr = result
        }
        return curr as U
    }
    view.reduceAsync = async <U>(
        callbackfn: (previousValue: T | U, currentValue: T | U, currentIndex: number, array: ArrayView<T>) => Promise<U>,
        initialValue?: U
    ): Promise<U> => {
        const first = initialValue == null ? start + 1 : start
        let prev: T | U = initialValue == null ? array[first] : initialValue
        let curr: T | U = array[first]
        for (let i = first; i < end; i++) {
            const result = await callbackfn(prev, curr, i - first, view)
            prev = curr
            curr = result
        }
        return curr as U
    }
    view.slice = (_start?: number | null, _end?: number | null): ArrayView<T> => {
        const s = start + normalizeStart(view.length, _start ?? 0)
        const e = start + normalizeEnd(view.length, _end ?? view.length)

        if (e <= s) {
            return view
        }
        return createView(array, s, e)
    }
    view.some = (predicate: (value: T, index: number, view: ArrayView<T>) => unknown, thisArg?: any): boolean => {
        for (let i = start; i < end; i++) {
            if (predicate.call(thisArg, array[i], i, view)) {
                return true
            }
        }
        return false
    }

    return view
}
