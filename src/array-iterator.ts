import { Schedule } from './schedule'
const Soon = Schedule.Soon

export function* arrayIterator<T>(array: readonly T[], start: number, end: number): IterableIterator<T> {
    for (let i = start; i < end; i++) {
        yield array[i]
    }
}

export async function* arrayIteratorAsync<T>(a: readonly T[], start: number, end: number, scheduler = Soon): AsyncIterableIterator<T> {
    for (let i = start; i < end; i++) {
        yield await scheduler(() => a[i])
    }
}
