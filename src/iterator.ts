import { normalizeEnd, normalizeStart } from './lib/normalize'
import { Subject, Unsubscribe, createObserver } from './lib/observable'
import { IScheduler } from './lib/schedule'

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

export function fromSubject<T>(subject: Subject<T>): AsyncIterableIterator<T> {
    const queue: T[] = []
    const loiterMs = fpsMs(60)
    let disposer: Unsubscribe | null = null

    const observer = createObserver<T>({
        next: value => void queue.push(value),
    })

    disposer = subject.subscribe(observer)
    const dispose = () => void (disposer?.(), (disposer = null))

    const loiter = async (queue: T[], ms: number) => {
        while (queue.length === 0 && !subject.isComplete) await wait(ms)
    }

    const result: AsyncIterableIterator<T> = {
        async next() {
            if (subject.isComplete || subject.hasError) dispose()

            await Promise.race([loiter(queue, loiterMs)])
            const value = queue.shift()

            if (value != null) {
                return { value, done: false }
            }
            return { value: undefined, done: true }
        },
        async return(value?: T) {
            dispose()
            return { value, done: true }
        },
        async throw(e: any) {
            dispose()
            subject.error(new Error(`<fromObservable> throw called: ${e}`))
            return { value: undefined, done: true }
        },
        [Symbol.asyncIterator]() {
            return this
        },
    }
    return result
}

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

const asyncScheduler = (scheduler?: IScheduler) => {
    if (scheduler != null) {
        return <T>(value: T) => scheduler.schedule(() => value)
    }
    return <T>(value: T) => Promise.resolve(value)
}

export async function* async<T>(it: Iterable<T>, scheduler?: IScheduler): AsyncIterableIterator<T> {
    const schedule = asyncScheduler(scheduler)

    for (const value of it) {
        yield await schedule(value)
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

const timeMs = (time: number, unit: 'ms' | 'sec' | 'min' | 'hr' | 'day' | 'week' | 'month' | 'year'): number => {
    switch (unit) {
        case 'ms':
            return Math.round(time)
        case 'sec':
            return timeMs(1000 * time, 'ms')
        case 'min':
            return timeMs(60 * time, 'sec')
        case 'hr':
            return timeMs(60 * time, 'min')
        case 'day':
            return timeMs(24 * time, 'hr')
        case 'week':
            return timeMs(7 * time, 'day')
        case 'month':
            return timeMs(time / 12, 'year')
        case 'year':
            return timeMs(365.25 * time, 'day')
    }
}

const fpsMs = (fps: number) => 1000 / fps

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// function timeout(ms: number) {
//     return <T>(value: T): Promise<T> => new Promise(resolve => void setTimeout(() => resolve(value), ms))
// }

// function immediate() {
//     return <T>(value: T): Promise<T> => new Promise(resolve => setImmediate(() => resolve(value)))
// }

// // console.log(timeMs(1, 'sec').toLocaleString())
// // console.log(timeMs(1, 'min').toLocaleString())
// // console.log(timeMs(1, 'hr').toLocaleString())
// // console.log(timeMs(1, 'day').toLocaleString())
// // console.log(timeMs(1, 'week').toLocaleString())

// async function main() {
//     const subject = Subject.fromAsync(async(count(100), Scheduler.immediate()))

//     for await (const v of fromSubject(subject)) {
//         console.log(v)
//     }
// }
// main()
