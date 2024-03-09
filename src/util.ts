import { normalizeEnd, normalizeStart } from './normalize'

export type ScanDir = 'fwd' | 'rev'

type Getter<T, U> = (value: T, index: number, context: any) => U

export type ArrayBuilder<T> = <U>(fn: Getter<T, U>, thisArg: any) => U[]
export type ArrayBuilderAsync<T> = <U>(fn: Getter<T, Promise<U>>, thisArg: any) => Promise<U[]>
export type KeyType = string | number | symbol
export type KeyFn<Key, Value> = (value: Value) => Key

export type Predicate<T> = (value: T, index: number) => any
export type Mapper<T> = <U>(value: T, index: number) => U

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

export function arrayBuilder<T, V>(array: readonly T[], start: number, end: number, context: V): ArrayBuilder<T> {
    start = normalizeStart(array.length, start)
    end = normalizeEnd(array.length, end)

    return <U>(fn: Getter<T, U>, thisArg: any) => {
        const list: U[] = []
        for (const i of range(start, end)) {
            list.push(fn.call(thisArg, array[i], i, context))
        }
        return list
    }
}

export function arrayBuilderAsync<T, V>(array: readonly T[], start: number, end: number, context: V): ArrayBuilderAsync<T> {
    start = normalizeStart(array.length, start)
    end = normalizeEnd(array.length, end)

    return async <U>(fn: Getter<T, Promise<U>>, thisArg: any) => {
        const list: U[] = []
        for (const i of range(start, end)) {
            list.push(await fn.call(thisArg, array[i], i, context))
        }
        return list
    }
}

export function* arrayIterator<T>(array: readonly T[], start: number, end: number, ratio: number, dir: ScanDir): IterableIterator<T> {
    const $end = ratio > 0 ? Math.round((end - start) * ratio) : end

    if (dir === 'fwd') {
        for (let i = start; i < $end; i++) {
            yield array[i] as T
        }
    } else {
        for (let i = $end - 1; i >= start; i--) {
            yield array[i] as T
        }
    }
}

export function* filterIterator<T>(it: Iterable<T>, predicate: Predicate<T>): IterableIterator<[T, number]> {
    for (const [i, v] of enumerate(it)) {
        if (predicate(v, i)) {
            yield [v, i]
        }
    }
}

export function* mapIterator<T>(it: Iterable<T>, mapper: Mapper<T>) {
    //
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
