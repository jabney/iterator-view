import {
    Mapper,
    Predicate,
    ScanDir,
    arrayRangeIterator,
    count,
    enumerate,
    filterIterator,
    mapIterator,
    skipIterator,
    takeIterator,
} from './iterator'

interface IView {}

class ArrayView<T> implements Iterable<T> {
    static create<T>(it: Iterable<T>) {
        new ArrayView(it)
    }

    static fromArray<T>(array: readonly T[], start?: number, end?: number, dir: ScanDir = 'fwd') {
        return new ArrayView(arrayRangeIterator(array, start, end, dir))
    }

    constructor(private readonly it: Iterable<T>) {}

    map<U>(mapper: Mapper<T, U>): ArrayView<U> {
        return new ArrayView<U>(mapIterator(this.it, mapper))
    }

    filter(predicate: Predicate<T>): ArrayView<T> {
        return new ArrayView(filterIterator(this.it, predicate))
    }

    enumerate(): IterableIterator<[number, T]> {
        return enumerate(this)
    }

    skip(num: number): ArrayView<T> {
        return new ArrayView(skipIterator(this.it, num))
    }

    take(num: number): ArrayView<T> {
        return new ArrayView(takeIterator(this.it, num))
    }

    render(): ArrayView<T> {
        return new ArrayView(this.toArray())
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
const view = new ArrayView(count(10))

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
