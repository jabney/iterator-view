import {
    Mapper,
    Predicate,
    Direction,
    arrayRangeIterator,
    enumerate,
    filterIterator,
    mapIterator,
    index,
    groupify,
    KeyFn,
    transform,
    reduce,
} from './iterator'
import { normalizeEnd, normalizeStart } from './lib/normalize'
import { Scheduler } from './schedule'

interface FromArrayOptions {
    start: number
    end: number
    direction: Direction
}

export class IteratorView<T> implements Iterable<T>, AsyncIterable<T> {
    static create<T>(it: Iterable<T>) {
        return new IteratorView(it)
    }

    static fromArray<T>(array: readonly T[], options?: Partial<FromArrayOptions>) {
        const start = normalizeStart(array.length, options?.start ?? 0)
        const end = normalizeEnd(array.length, options?.end ?? array.length)
        const direction = options?.direction ?? 'fwd'
        return new IteratorView(arrayRangeIterator(array, start, end, direction))
    }

    constructor(
        private readonly it: Iterable<T>,
        readonly scheduler = Scheduler.immediate()
    ) {}

    map<U>(mapper: Mapper<T, U>): IteratorView<U> {
        return new IteratorView<U>(mapIterator(this.it, mapper), this.scheduler)
    }

    filter(predicate: Predicate<T>): IteratorView<T> {
        return new IteratorView(filterIterator(this.it, predicate), this.scheduler)
    }

    reduce<U>(reducer: (prev: U, curr: T) => U) {
        return new IteratorView(reduce(this.it, reducer), this.scheduler)
    }

    enumerate(): IteratorView<[number, T]> {
        return new IteratorView(enumerate(this.it), this.scheduler)
    }

    transform<U>(transformer: (value: T) => U): IteratorView<U> {
        return new IteratorView(transform(this.it, transformer), this.scheduler)
    }

    index(): IteratorView<number> {
        return new IteratorView(index(this.it), this.scheduler)
    }

    render(): IteratorView<T> {
        return new IteratorView(this.toArray())
    }

    toArray(): T[] {
        return [...this.it]
    }

    *iterator(): Iterator<T> {
        for (const v of this.it) yield v
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        for await (const v of this.it) yield await this.scheduler.schedule(() => v)
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const v of this.it) yield v
    }

    groupify<Key>(key: KeyFn<Key, T>) {
        return groupify(this.it, key)
    }
}
