import { normalizeEnd, normalizeStart } from '../lib/normalize'
import { IScheduler } from '../schedule'

export type Direction = 'fwd' | 'rev'

export type ValueFn<T, U> = (value: T, index: number) => U

export type KeyFn<Key, Value> = (value: Value) => Key
export type Predicate<T> = (value: T) => unknown
export type Mapper<T, U> = (value: T) => U

export function mapify<V, K>(it: Iterable<V>, key: KeyFn<K, V>): Map<K, V> {
    const map = new Map<K, V>()
    for (const v of it) map.set(key(v), v)
    return map
}

export async function mapifyAsync<V, K>(it: Iterable<V>, key: KeyFn<Promise<K>, V>): Promise<Map<K, V>> {
    const map = new Map<K, V>()
    for (const v of it) map.set(await key(v), v)
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

export async function groupifyAsync<V, K>(it: Iterable<V>, key: KeyFn<Promise<K>, V>): Promise<Map<K, V[]>> {
    const map = new Map<K, V[]>()
    for (const v of it) {
        const k = await key(v)
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

export async function partitionAsync<V, K>(it: Iterable<V>, key: KeyFn<Promise<K>, V>): Promise<IterableIterator<V[]>> {
    const map = await groupifyAsync(it, key)
    return map.values()
}

// export function* arrayIterator<T>(array: readonly T[], start: number, end: number, dir: ScanDir = "fwd"): IterableIterator<T> {
//     start = normalizeStart(array.length, start)
//     end = normalizeEnd(array.length, end)

//     if (dir === 'fwd') {
//         for (let i = start; i < $end; i++) {
//             yield array[i] as T
//         }
//     } else {
//         for (let i = $end - 1; i >= start; i--) {
//             yield array[i] as T
//         }
//     }
// }

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

export function* index<T>(it: Iterable<T>): IterableIterator<number> {
    let i = 0
    for (const v of it) {
        yield i++
    }
}

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

export function* skipIterator<T>(it: Iterable<T>, num: number) {
    for (const [i, v] of enumerate(it)) {
        if (i < num) continue
        yield v
    }
}

export function* count(num: number): IterableIterator<number> {
    for (let i = 0; i < num; i++) {
        yield i
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

export async function* asyncIterator<T>(it: Iterable<T>, scheduler: IScheduler): AsyncIterableIterator<T> {
    for (const value of it) {
        yield await scheduler.schedule(() => value)
    }
}
