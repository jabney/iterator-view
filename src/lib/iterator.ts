import { normalizeEnd, normalizeStart } from './normalize'
// import { Disposer, IObservable } from './observable'

export type Direction = 'fwd' | 'rev'

export type ValueFn<T, U> = (value: T, index: number) => U

export type KeyFn<Key, Value> = (value: Value) => Key
export type Predicate<T> = (value: T) => unknown
export type Mapper<T, U> = (value: T) => U

// -------------------------------------------------
// Generate
// -------------------------------------------------

export function* index<T>(it: Iterable<T>): IterableIterator<number> {
    let i = 0
    for (const v of it) {
        yield i++
    }
}

export function* range(start: number, end: number, dir: Direction = 'fwd'): IterableIterator<number> {
    const [$dir, min, max] = normalizeRange(start, end, dir)

    if ($dir == 'fwd') {
        for (let i = min; i < max; i++) {
            yield i
        }
    } else {
        for (let i = max; i > min; i--) {
            yield i
        }
    }
}

export function* count(num: number): IterableIterator<number> {
    for (let i = 0; i < num; i++) {
        yield i
    }
}

// export function fromObservable<T>(observable: IObservable<T>): AsyncIterableIterator<T> {
//     const queue: T[] | null = null
//     let disposer: Disposer | null = null
//     // let promise: Promise<T>

//     disposer = observable.subscribe(x => {
//         // yield x
//     })

//     const dispose = () => void (disposer?.(), (disposer = null))

//     return {
//         async next() {
//             // while (queue == null) await timeout()
//             // const value = queue.shift()
//             return Promise.resolve({ value: value! })
//         },
//         return(value: T) {
//             dispose()
//             return Promise.resolve({ value, done: true })
//         },
//         throw(e: any) {
//             dispose()
//             return Promise.resolve({ value: undefined, done: true })
//         },
//         [Symbol.asyncIterator]() {
//             return this
//         },
//     }
// }

//
// Transform
// -------------------------------------------------

export function* filterIterator<T>(it: Iterable<T>, predicate: Predicate<T>): IterableIterator<T> {
    for (const v of it) if (predicate(v)) yield v
}

export function* mapIterator<T, U>(it: Iterable<T>, mapper: Mapper<T, U>): IterableIterator<U> {
    for (const v of it) yield mapper(v)
}

export function* enumerate<T>(it: Iterable<T>): IterableIterator<[number, T]> {
    let i = 0
    for (const v of it) {
        yield [i++, v]
    }
}

export function* promisify<T>(it: Iterable<T>, schedule: number | boolean = true): IterableIterator<Promise<T>> {
    const scheduleFn = scheduler(schedule)
    for (const value of it) {
        yield scheduleFn(value)
    }
}

export async function* async<T>(it: Iterable<T>): AsyncIterableIterator<T> {
    for (const value of it) {
        yield await value
    }
}

//
// Builder
// -------------------------------------------------

export function mapify<V, K>(it: Iterable<V>, key: KeyFn<K, V>): Map<K, V> {
    const map = new Map<K, V>()
    for (const v of it) map.set(key(v), v)
    return map
}

export function groupify<V, K>(it: Iterable<V>, key: KeyFn<K, V>): Map<K, V[]> {
    const map = new Map<K, V[]>()
    for (const v of it) {
        const k = key(v)
        const array = map.get(k) ?? []
        array.push(v)
        map.set(k, array)
    }
    return map
}

export function partition<V, K>(it: Iterable<V>, key: KeyFn<K, V>): IterableIterator<V[]> {
    const map = groupify(it, key)
    return map.values()
}

//
// Array
// -------------------------------------------------

export function* forwardIterator<T>(array: readonly T[], start: number, end: number): IterableIterator<[T, number]> {
    if (end < start) return yield* reverseIterator(array, end + 1, start + 1)

    for (let i = start; i < end; i++) {
        yield [array[i], i - start]
    }
}

export function* reverseIterator<T>(array: readonly T[], start: number, end: number): IterableIterator<[T, number]> {
    if (end < start) return yield* forwardIterator(array, end + 1, start + 1)

    for (let i = end - 1; i >= start; i--) {
        yield [array[i], end - i - 1]
    }
}

export function* arrayRangeIterator<T>(array: readonly T[], start = 0, end = array.length, dir: Direction) {
    start = normalizeStart(array.length, start)
    end = normalizeEnd(array.length, end)
    if (dir === 'fwd') {
        yield* forwardIterator(array, start, end)
    } else {
        yield* reverseIterator(array, start, end)
    }
}

//
// Placeholder
// -------------------------------------------------

export function* rangeIterator<T>(it: Iterable<T>, start: number, end: number): IterableIterator<T> {
    for (const [i, v] of enumerate(it)) {
        if (i >= start) {
            if (i < end) {
                yield v
            } else {
                break
            }
        }
    }
}

export function* takeIterator<T>(it: Iterable<T>, num: number): IterableIterator<T> {
    for (const [i, v] of enumerate(it)) {
        if (i < num) {
            yield v
        } else {
            break
        }
    }
}

export function* skipIterator<T>(it: Iterable<T>, num: number) {
    for (const [i, v] of enumerate(it)) {
        if (i < num) continue
        yield v
    }
}

//
// Helpers
// -------------------------------------------------

const normalizeRange = (start: number, end: number, dir: Direction): [Direction, number, number] => {
    if (start <= end) {
        return dir === 'fwd' ? [dir, start, end] : [dir, start - 1, end - 1]
    }

    if (dir === 'fwd') {
        return ['rev', end, start]
    } else {
        return ['fwd', end + 1, start + 1]
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function scheduler(schedule: number | boolean) {
    if (schedule === false) {
        return <T>(value: T) => Promise.resolve(value)
    } else {
        const fn = typeof schedule === 'number' ? timeout(schedule) : immediate()
        return <T>(value: T) => fn(value)
    }
}

function timeout(ms: number) {
    return <T>(value: T): Promise<T> => new Promise(resolve => void setTimeout(() => resolve(value), ms))
}

function immediate() {
    return <T>(value: T): Promise<T> => new Promise(resolve => setImmediate(() => resolve(value)))
}
