import { Color } from './lib/color'
import { Mapper, Predicate, Direction, arrayRangeIterator, count, enumerate, filterIterator, mapIterator, index } from './iterator'
import { normalizeEnd, normalizeStart } from './lib/normalize'
import { ControlSubject, Scheduler } from './lib/schedule'

interface FromArrayOptions {
    start: number
    end: number
    direction: Direction
}

class IteratorView<T> implements Iterable<T>, AsyncIterable<T> {
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
        protected readonly it: Iterable<T>,
        protected readonly scheduler = Scheduler.immediate()
    ) {}

    map<U>(mapper: Mapper<T, U>): IteratorView<U> {
        return new IteratorView<U>(mapIterator(this.it, mapper), this.scheduler)
    }

    filter(predicate: Predicate<T>): IteratorView<T> {
        return new IteratorView(filterIterator(this.it, predicate), this.scheduler)
    }

    enumerate(): IteratorView<[number, T]> {
        return new IteratorView(enumerate(this.it), this.scheduler)
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
}

const subject = new ControlSubject()
const scheduler = Scheduler.controlled(subject, Scheduler.timeout(100))

async function main(color: (str: { toString(): string }) => Color) {
    const view = new IteratorView(count(Infinity), scheduler)
        .filter(x => x % 10 === 0)
        .map(x => x ** 2)
        .index()

    subject.next(true)

    for await (const i of view) {
        console.log(`${color(i)}`)
    }
}

async function main2(color: (str: { toString(): string }) => Color) {
    const view = new IteratorView(count(Infinity), scheduler)
        .filter(x => x % 10 === 0)
        .map(x => x ** 2)
        .index()

    subject.next(true)

    for await (const i of view) {
        console.log(`${color(i)}`)
    }
}

async function main3(color: (str: { toString(): string }) => Color) {
    const view = new IteratorView(count(Infinity), scheduler)
        .filter(x => x % 10 === 0)
        .map(x => x ** 2)
        .index()

    subject.next(true)

    for await (const i of view) {
        console.log(`${color(i)}`)
    }
}

async function main4(color: (str: { toString(): string }) => Color) {
    const view = new IteratorView(count(Infinity), scheduler)
        .filter(x => x % 10 === 0)
        .map(x => x ** 2)
        .index()

    subject.next(true)

    for await (const i of view) {
        console.log(`${color(i)}`)
    }
}

function doTimeout(run: boolean) {
    setTimeout(() => {
        subject.next(run)
        doTimeout(!run)
    }, 5000)
}
doTimeout(false)

main(Color.white)
main2(Color.red)
main3(Color.green)
main4(Color.blue)

// const r = view
//     .filter(x => x % 2 === 0)
//     .map(x => x ** 2)
//     .enumerate()

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
