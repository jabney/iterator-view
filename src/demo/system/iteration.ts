/**
 *
 */
export function* count(num: number): IterableIterator<number> {
    num = Math.trunc(num)

    for (let i = 0; i < num; i++) {
        yield i
    }
}

export function* range(start: number, end: number): IterableIterator<number> {
    var [start, end] = [Math.trunc(start), Math.trunc(end)]

    for (let i = start; i < end; i++) {
        yield i
    }
}

export function* reverse(start: number, end: number): IterableIterator<number> {
    var [start, end] = [Math.trunc(start), Math.trunc(end)]

    for (let i = end - 1; i >= start; i--) {
        yield i
    }
}

export function* enumerate<T>(it: Iterable<T>): IterableIterator<[number, T]> {
    let index = 0
    for (const v of it) {
        yield [index++, v]
    }
}
