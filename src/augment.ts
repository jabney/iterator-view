import { ArrayView } from './types'

const normalizeStart = (length: number, start: number | undefined): number => {
    start = start ?? 0

    if (start < 0) {
        start = start + length
    } else if (start < -length) {
        start = 0
    } else if (start >= length) {
        start = length
    }
    return start
}

const normalizeEnd = (length: number, end: number | undefined): number => {
    end = end ?? length

    if (end < 0) {
        end = end + length
    } else if (end < -length) {
        end = 0
    } else if (end >= length) {
        end = length
    }
    return end
}

type CreateView<T> = (array: readonly T[], start: number, end: number) => ArrayView<T>

export const augment = <T>(
    array: readonly T[],
    view: ArrayView<T>,
    start: number,
    end: number,
    createView: CreateView<T>
): ArrayView<T> => {
    view.at = (index: number) => {
        if (index < 0) {
            return array[start + index + array.length]
        }
        return array[start + index]
    }
    view.keys = function* keys(): IterableIterator<number> {
        for (let i = start; i < end; i++) {
            yield i - start
        }
    }
    view.values = function* values(): IterableIterator<T> {
        for (let i = start; i < end; i++) {
            yield array[i - start]
        }
    }
    view.entries = function* entries(): IterableIterator<[number, T]> {
        for (let i = start; i < end; i++) {
            yield [i - start, array[i - start]]
        }
    }
    view.map = <U>(callbackfn: (value: T, index: number, view: ArrayView<T>) => U, thisArg?: any): U[] => {
        const list: U[] = []
        for (let i = start; i < end; i++) {
            list.push(callbackfn.call(thisArg, array[i - start], i - start, view))
        }
        return list
    }
    view.mapAsync = async <U>(
        callbackfn: (value: T, index: number, view: ArrayView<T>) => Promise<U>,
        thisArg?: any
    ): Promise<U[]> => {
        const list: U[] = []
        for (let i = start; i < end; i++) {
            let value = await callbackfn.call(thisArg, array[i - start], i - start, view)
            list.push(value)
        }
        return list
    }
    view.filter = <S extends T>(
        predicate: (value: T, index: number, array: ArrayView<T>) => value is S,
        thisArg?: any
    ): S[] => {
        const list: S[] = []
        for (let i = start; i < end; i++) {
            if (predicate.call(thisArg, array[i - start], i - start, view) === true) {
                list.push(array[i - start] as S)
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
            const result = await predicate.call(thisArg, array[i - start], i - start, view)
            if (result === true) {
                list.push(array[i - start] as S)
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
        callbackfn: (
            previousValue: T | U,
            currentValue: T | U,
            currentIndex: number,
            array: ArrayView<T>
        ) => Promise<U>,
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
    view.slice = (start?: number, end?: number): ArrayView<T> => {
        start = normalizeStart(array.length, start)
        end = normalizeEnd(array.length, end)
        if (end <= start) {
            return view
        }
        return createView(array, start, end)
    }
    return view
}
