import { IScheduler } from '../schedule'

export function* arrayIterator<T>(array: readonly T[], start: number, end: number): IterableIterator<T> {
    for (let i = start; i < end; i++) {
        yield array[i]
    }
}

export async function* arrayIteratorAsync<T>(
    array: readonly T[],
    start: number,
    end: number,
    scheduler: IScheduler
): AsyncIterableIterator<T> {
    for (let i = start; i < end; i++) {
        yield await scheduler.schedule(() => array[i])
    }
}
