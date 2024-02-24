import { Schedule } from './schedule'

export function* arrayIterator<T>(array: readonly T[], start: number, end: number): IterableIterator<T> {
    for (let i = start; i < end; i++) {
        yield array[i]
    }
    // let current = start
    // return {
    //     next() {
    //         const done = current === end
    //         const result: IteratorResult<T> = done
    //             ? {
    //                   done: true,
    //                   value: undefined,
    //               }
    //             : {
    //                   value: array[current],
    //               }
    //         current += 1
    //         return result
    //     },
    //     [Symbol.iterator]() {
    //         return this
    //     },
    // }
}

export async function* arrayIteratorAsync<T>(array: readonly T[], start: number, end: number): AsyncIterableIterator<T> {
    for (let i = start; i < end; i++) {
        yield await Schedule.Soon(() => array[i])
    }
    // let current = start
    // return {
    //     async next() {
    //         const done = current === end
    //         const result: IteratorResult<T> = done
    //             ? {
    //                   done: true,
    //                   value: undefined,
    //               }
    //             : {
    //                   value: array[current],
    //               }
    //         current += 1
    //         return await Schedule.Soon(() => result)
    //     },
    //     [Symbol.asyncIterator]() {
    //         return this
    //     },
    // }
}
