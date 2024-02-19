export const arrayIterator = <T>(array: readonly T[], start: number, end: number): IterableIterator<T> => {
    let current = start
    return {
        next() {
            const done = current === end
            const result: IteratorResult<T> = done
                ? {
                      done: true,
                      value: undefined,
                  }
                : {
                      value: array[current],
                  }
            current += 1
            return result
        },
        [Symbol.iterator]() {
            return this
        },
    }
}
