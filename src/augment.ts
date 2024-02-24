import { normalizeEnd, normalizeStart } from './normalize'
import { ArrayView } from './types'

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
    view.slice = (_start?: number | null, _end?: number | null): ArrayView<T> => {
        const s = start + normalizeStart(view.length, _start ?? 0)
        const e = start + normalizeEnd(view.length, _end ?? view.length)

        if (e <= s) {
            return view
        }
        return createView(array, s, e)
    }
    return view
}

// const list =  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] // 10
// const list2 = [    'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] // 8
// const list3 = [         'c', 'd', 'e', 'f', 'g', 'h'] // 6

// console.log(list2.slice(1, -1))

// console.log(list.slice(normalizeStart(list.length, -1)))

// for (let i = -list.length - 1; i <= list.length + 1; i++) {
//     console.log(`normalizeStart(${list.length}, ${i})`, normalizeStart(list.length, i))
// }

// for (let i = -list.length - 1; i <= list.length + 1; i++) {
//     console.log(`normalizeEnd(${list.length}, ${i})`, normalizeEnd(list.length, i))
// }

// for (let i = -list.length - 1; i <= list.length + 1; i++) {
//     console.log(`slice(0, ${i})`, list.slice(0, normalizeEnd(list.length, i)))
// }
