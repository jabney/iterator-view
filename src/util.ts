import { normalizeEnd, normalizeStart } from './normalize'

export type ScanDir = 'fwd' | 'rev'

export type ValueFn<T, U> = (value: T, index: number) => U

export type KeyFn<Key, Value> = (value: Value) => Key
export type Predicate<T> = (value: T) => unknown
export type Mapper<T, U> = (value: T) => U
export type Scheduler = () => Promise<void>

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

export function* range(start: number, end: number, dir: ScanDir = 'fwd'): IterableIterator<number> {
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

const normalizeRange = (start: number, end: number, dir: ScanDir): [ScanDir, number, number] => {
    if (start <= end) {
        return dir === 'fwd' ? [dir, start, end] : [dir, start - 1, end - 1]
    }

    if (dir === 'fwd') {
        return ['rev', end, start]
    } else {
        return ['fwd', end + 1, start + 1]
    }
}

const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value))

export function* arrayRangeIterator<T>(array: readonly T[], start = 0, end = array.length, dir: ScanDir) {
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

export async function* asyncIterable<T>(it: Iterable<T>): AsyncIterableIterator<T> {
    //
}

interface IView {}

class View<T> implements Iterable<T> {
    static create<T>(it: Iterable<T>) {
        new View(it)
    }

    static fromArray<T>(array: readonly T[], start?: number, end?: number, dir: ScanDir = 'fwd') {
        return new View(arrayRangeIterator(array, start, end, dir))
    }

    constructor(private readonly it: Iterable<T>) {}

    map<U>(mapper: Mapper<T, U>): View<U> {
        return new View<U>(mapIterator(this.it, mapper))
    }

    filter(predicate: Predicate<T>): View<T> {
        return new View(filterIterator(this.it, predicate))
    }

    enumerate(): IterableIterator<[number, T]> {
        return enumerate(this)
    }

    skip(num: number): View<T> {
        return new View(skipIterator(this.it, num))
    }

    take(num: number): View<T> {
        return new View(takeIterator(this.it, num))
    }

    render(): View<T> {
        return new View(this.toArray())
    }

    toArray(): T[] {
        return [...this.it]
    }

    *iterator(): Iterator<T> {
        for (const v of this.it) yield v
    }

    async *asyncIterator(): AsyncIterator<T> {
        for await (const v of this.it) yield v
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const v of this.it) yield v
    }
}

const list = [...count(100)]
const view = new View(count(10))

// const r = view
//     .filter(x => x % 2 === 0)
//     .map(x => x ** 2)
//     .enumerate()

const r = view.skip(3).take(3)

for (const v of r) {
    console.log(v)
}

// const it = r.iterator()
// console.log(it.next())
// console.log(it.next())
// console.log(it.next())
// console.log(it.next())

/**
 *
 */

// const it = reverseIterator(list, 0, 9)

// for (const [v, i] of it) {
//     console.log(`[${i}]:`, v)
// }
