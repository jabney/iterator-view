import {
    Mapper,
    Predicate,
    Direction,
    arrayRange,
    enumerate,
    filterIterator,
    mapIterator,
    index,
    groupify,
    KeyFn,
    transform,
    reduce,
    Reducer,
    reverseIterator,
    async,
} from './iterator'
import { IteratorView } from './iterator-view'
import { normalizeBounds, normalizeEnd, normalizeStart } from './lib/normalize'
import { createOptions } from './lib/options'
import { Scheduler } from './schedule'

interface Options {
    start: number
    end: number
    direction: Direction
}

const getOptions = createOptions<Options>({
    start: 0,
    end: 0,
    direction: 'fwd',
})

export class ArrayView<T> implements Iterable<T>, AsyncIterable<T> {
    static fromIterable<T>(it: Iterable<T>) {
        return new IteratorView(it)
    }

    static create<T>(array: readonly T[], options?: Partial<Options> | null, scheduler = Scheduler.immediate()) {
        const o = getOptions({ ...options, end: options?.end ?? array.length })
        return new ArrayView(array, o.start, o.end, o.direction, scheduler)
    }

    constructor(
        private readonly array: readonly T[],
        private readonly start: number,
        private readonly end: number,
        private readonly direction: Direction,
        readonly scheduler: Scheduler
    ) {
        this.start = normalizeStart(array.length, start)
        this.end = normalizeEnd(array.length, end ?? array.length)
    }

    get length() {
        return this.end - this.start
    }

    map<U>(mapper: Mapper<T, U>): IteratorView<U> {
        const it = mapIterator(this.iterator(), mapper)
        return new IteratorView<U>(it, this.scheduler)
    }

    filter(predicate: Predicate<T>): IteratorView<T> {
        const it = filterIterator(this.iterator(), predicate)
        return new IteratorView(it, this.scheduler)
    }

    reduce<U>(reducer: Reducer<T, U>): IteratorView<U> {
        const it = reduce(this.iterator(), reducer)
        return new IteratorView(it, this.scheduler)
    }

    enumerate(): IteratorView<[number, T]> {
        return new IteratorView(enumerate(this.array), this.scheduler)
    }

    range(start?: number, end?: number, direction?: Direction): IteratorView<T> {
        start = this.start + normalizeStart(this.length, start ?? 0)
        end = this.start + normalizeEnd(this.length, end ?? this.length)
        return new IteratorView(arrayRange(this.array, start, end, direction ?? 'fwd'))
    }

    reverse() {
        const direction = this.direction === 'fwd' ? 'rev' : 'fwd'
        return new ArrayView(this.array, this.start, this.end, direction, this.scheduler)
    }

    clone() {
        return new ArrayView(this.array, this.start, this.end, this.direction, this.scheduler)
    }

    render(): ArrayView<T> {
        return ArrayView.create(this.toArray(), null, this.scheduler)
    }

    toArray(): T[] {
        return [...this.iterator()]
    }

    iterator(): IterableIterator<T> {
        return arrayRange(this.array, this.start, this.end, this.direction)
    }

    asyncIterator(): AsyncIterableIterator<T> {
        return async(arrayRange(this.array, this.start, this.end, this.direction))
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const v of this.iterator()) yield v
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        for await (const v of this.asyncIterator()) yield await this.scheduler.schedule(() => v)
    }

    groupify<Key>(key: KeyFn<Key, T>): Map<Key, T[]> {
        return groupify(this.iterator(), key)
    }
}
