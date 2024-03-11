import { ArrayBuilder, arrayBuilder } from './array-builder'
import { arrayIterator, arrayIteratorAsync } from '../lib/array-iterator'
import { normalizeEnd, normalizeStart } from '../lib/normalize'
import { createProxy } from '../lib/proxy'
import { IArrayView } from './types'
import { KeyFn, groupify, groupifyAsync, mapify, mapifyAsync, partition, partitionAsync, range } from './iterator'
import { Scheduler } from '../schedule'

class ArrayView<T> implements IArrayView<T> {
    private subArray: ArrayBuilder<T>

    constructor(
        private readonly array: readonly T[],
        private readonly start: number,
        private readonly end: number,
        private readonly scheduler: Scheduler
    ) {
        this.subArray = arrayBuilder(this.array, this.start, this.end)
    }

    get length(): number {
        return this.end - this.start
    }

    at(index: number): T {
        return this.array[this.start + normalizeStart(this.length, index)]
    }

    concat(...items: (T | ConcatArray<T>)[]): IArrayView<T> {
        return arrayView(this.toArray().concat(...items))
    }

    find(predicate: (value: T, index: number, obj: IArrayView<T>) => unknown, thisArg?: any): T | undefined {
        for (let i = this.start; i < this.end; i++) {
            if (predicate.call(thisArg, this.array[i], i - this.start, this)) {
                return this.array[i]
            }
        }
    }

    findIndex(predicate: (value: T, index: number, obj: ArrayView<T>) => unknown, thisArg?: any): number {
        for (let i = this.start; i < this.end; i++) {
            if (predicate.call(thisArg, this.array[i], i - this.start, this)) {
                return i - this.start
            }
        }
        return -1
    }

    includes(searchElement: T, fromIndex?: number): boolean {
        return this.array.includes(searchElement, this.start + (fromIndex ?? 0))
    }

    indexOf(searchElement: T, fromIndex?: number): number {
        return this.array.indexOf(searchElement, this.start + (fromIndex ?? 0))
    }

    lastIndexOf(searchElement: T, fromIndex?: number): number {
        return this.array.lastIndexOf(searchElement, this.start + (fromIndex ?? this.end))
    }

    join(separator?: string): string {
        return this.toArray().join(separator)
    }

    *keys(): IterableIterator<number> {
        for (let i = this.start; i < this.end; i++) {
            yield i - this.start
        }
    }

    *values(): IterableIterator<T> {
        for (let i = this.start; i < this.end; i++) {
            yield this.array[i]
        }
    }

    *entries(): IterableIterator<[number, T]> {
        for (const i of range(0, this.length)) {
            yield [i, this.array[this.start + i]]
        }
    }

    *range(start: number = 0, end: number = this.length): IterableIterator<[number, T]> {
        start = normalizeStart(this.length, start)
        end = normalizeEnd(this.length, end)

        for (const i of range(start, end)) {
            yield [i, this.array[this.start + i]]
        }
    }

    mapify<K>(key: KeyFn<K, T>): Map<K, T> {
        return mapify(this, key)
    }

    mapifyAsync<K>(key: KeyFn<Promise<K>, T>): Promise<Map<K, T>> {
        return mapifyAsync(this, key)
    }

    groupify<K>(key: KeyFn<K, T>): Map<K, T[]> {
        return groupify(this, key)
    }

    groupifyAsync<K>(key: KeyFn<Promise<K>, T>): Promise<Map<K, T[]>> {
        return groupifyAsync(this, key)
    }

    partition<K>(key: KeyFn<K, T>): IterableIterator<T[]> {
        return partition(this, key)
    }

    partitionAsync<K>(key: KeyFn<Promise<K>, T>): Promise<IterableIterator<T[]>> {
        return partitionAsync(this, key)
    }

    every(predicate: (value: T, index: number, view: IArrayView<T>) => unknown, thisArg?: any): boolean {
        for (let i = this.start; i < this.end; i++) {
            if (!predicate.call(thisArg, this.array[i], i - this.start, this)) {
                return false
            }
        }
        return true
    }

    async everyAsync(
        predicate: (value: T, index: number, view: IArrayView<T>) => Promise<unknown> | unknown,
        thisArg?: any
    ): Promise<boolean> {
        for (let i = this.start; i < this.end; i++) {
            const result = await predicate.call(thisArg, this.array[i], i - this.start, this)
            if (!result) {
                return false
            }
        }
        return true
    }

    map<U>(callbackfn: (value: T, index: number, view: IArrayView<T>) => U, thisArg?: any): IArrayView<U> {
        return arrayView(this.subArray((v, i) => callbackfn.call(thisArg, v, i, this)))
    }

    async mapAsync<U>(callbackfn: (value: T, index: number, view: IArrayView<T>) => Promise<U>, thisArg?: any): Promise<IArrayView<U>> {
        const list: U[] = []
        for (let i = this.start; i < this.end; i++) {
            let value = await callbackfn.call(thisArg, this.array[i], i - this.start, this)
            list.push(value)
        }
        return arrayView(list)
    }

    filter<S extends T>(predicate: (value: T, index: number, ArrayView: IArrayView<T>) => value is S, thisArg?: any): IArrayView<S> {
        const list: S[] = []
        for (let i = this.start; i < this.end; i++) {
            if (predicate.call(thisArg, this.array[i], i - this.start, this)) {
                list.push(this.array[i] as S)
            }
        }
        return arrayView(list)
    }

    async filterAsync<S extends T>(
        predicate: (value: T, index: number, view: IArrayView<T>) => Promise<unknown>,
        thisArg?: any
    ): Promise<IArrayView<S>> {
        const list: S[] = []
        for (let i = this.start; i < this.end; i++) {
            const result = await predicate.call(thisArg, this.array[i], i - this.start, this)
            if (result) {
                list.push(this.array[i] as S)
            }
        }
        return arrayView(list)
    }

    forEach(callbackfn: (value: T, index: number, view: IArrayView<T>) => void, thisArg?: any): void {
        for (let i = this.start; i < this.end; i++) {
            callbackfn.call(thisArg, this.array[i], i - this.start, this)
        }
    }

    async forEachAsync(callbackfn: (value: T, index: number, view: IArrayView<T>) => Promise<void>, thisArg?: any): Promise<void> {
        for (let i = this.start; i < this.end; i++) {
            await callbackfn.call(thisArg, this.array[i], i - this.start, this)
        }
    }

    reduce<U>(callbackfn: (previous: T | U, current: T | U, index: number, view: IArrayView<T>) => U, initialValue?: U): U {
        const first = initialValue == null ? this.start + 1 : this.start
        let prev: T | U = initialValue == null ? this.array[first] : initialValue
        let curr: T | U = this.array[first]
        for (let i = first; i < this.end; i++) {
            const result = callbackfn(prev, curr, i - first, this)
            prev = curr
            curr = result
        }
        return curr as U
    }

    async reduceAsync<U>(
        callbackfn: (previous: T | U, current: T | U, index: number, view: IArrayView<T>) => Promise<U>,
        initialValue?: U
    ): Promise<U> {
        const first = initialValue == null ? this.start + 1 : this.start
        let prev: T | U = initialValue == null ? this.array[first] : initialValue
        let curr: T | U = this.array[first]
        for (let i = first; i < this.end; i++) {
            const result = await callbackfn(prev, curr, i - first, this)
            prev = curr
            curr = result
        }
        return curr as U
    }

    reduceRight(callbackfn: (previous: T, current: T, index: number, view: IArrayView<T>) => T, initialValue?: T): T {
        const last = initialValue == null ? this.end - 2 : this.end - 1
        let prev: T = initialValue == null ? this.array[last] : initialValue
        let curr: T = this.array[last]
        for (let i = last; i >= this.start; i--) {
            const result = callbackfn(prev, curr, i - last, this)
            prev = curr
            curr = result
        }
        return curr
    }

    async reduceRightAsync(
        callbackfn: (previous: T, current: T, index: number, view: IArrayView<T>) => Promise<T>,
        initialValue?: T
    ): Promise<T> {
        const last = initialValue == null ? this.end - 2 : this.end - 1
        let prev: T = initialValue == null ? this.array[last] : initialValue
        let curr: T = this.array[last]
        for (let i = last; i >= this.start; i--) {
            const result = await callbackfn(prev, curr, i - last, this)
            prev = curr
            curr = result
        }
        return curr
    }

    slice(start?: number | null, end?: number | null): IArrayView<T> {
        const _start = this.start + normalizeStart(this.length, start ?? 0)
        const _end = this.start + normalizeEnd(this.length, end ?? this.length)

        if (_end <= _start) {
            return arrayView([], 0, 0)
        }
        return arrayView(this.array, _start, _end)
    }

    some(predicate: (value: T, index: number, view: IArrayView<T>) => unknown, thisArg?: any): boolean {
        for (let i = this.start; i < this.end; i++) {
            if (predicate.call(thisArg, this.array[i], i, this)) {
                return true
            }
        }
        return false
    }

    async someAsync(predicate: (value: T, index: number, view: IArrayView<T>) => Promise<unknown>, thisArg?: any): Promise<boolean> {
        for (let i = this.start; i < this.end; i++) {
            if (await predicate.call(thisArg, this.array[i], i, this)) {
                return true
            }
        }
        return false
    }

    first(): T {
        return this.array[this.start]
    }

    last(): T {
        return this.array[this.end - 1]
    }

    reset(start?: number, end?: number) {
        return arrayView(this.array, start, end)
    }

    toArray(): T[] {
        return this.array.slice(this.start, this.end)
    }

    [Symbol.iterator]() {
        return arrayIterator(this.array, this.start, this.end)
    }

    [Symbol.asyncIterator]() {
        return arrayIteratorAsync(this.array, this.start, this.end, this.scheduler)
    }

    [key: number]: T // required index signature on ArrayView for unscopables.

    get [Symbol.unscopables]() {
        return this.array[Symbol.unscopables]
    }
}

/**
 * Creates a view over an array.
 */
export function arrayView<T>(array: readonly T[], start?: number, end?: number): IArrayView<T> {
    const _start = normalizeStart(array.length, start ?? 0)
    const _end = normalizeEnd(array.length, end ?? array.length)
    const view = new ArrayView(array, _start, _end, Scheduler.immediate()) as unknown as IArrayView<T>
    return createProxy(view, array, _start, _end)
}

const list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const view = arrayView(list)

for (const [i, v] of view.range(-1)) {
    console.log(i, v)
}
