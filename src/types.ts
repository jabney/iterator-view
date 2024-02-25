type Redefined = 'every' | 'filter' | 'find' | 'findIndex' | 'flatMap' | 'forEach' | 'map' | 'reduce' | 'reduceRight' | 'slice' | 'some'

export interface IArrayView<T> extends Omit<ReadonlyArray<T>, Redefined> {
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every<S extends T>(predicate: (value: T, index: number, view: IArrayView<T>) => value is S, thisArg?: any): this is S[]
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: T, index: number, view: IArrayView<T>) => unknown, thisArg?: any): boolean
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    everyAsync<S extends T>(predicate: (value: T, index: number, view: IArrayView<T>) => Promise<unknown>, thisArg?: any): this is Promise<S[]>
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    everyAsync(predicate: (value: T, index: number, view: IArrayView<T>) => Promise<unknown>, thisArg?: any): Promise<boolean>
    /**
     * Returns the elements of a view that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the view.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter<S extends T>(predicate: (value: T, index: number, view: IArrayView<T>) => value is S, thisArg?: any): S[]
    filterAsync<S extends T>(predicate: (value: T, index: number, view: IArrayView<T>) => Promise<unknown>, thisArg?: any): this is Promise<S[]>
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find<S extends T>(predicate: (value: T, index: number, obj: IArrayView<T>) => value is S, thisArg?: any): S | undefined
    find(predicate: (value: T, index: number, obj: IArrayView<T>) => unknown, thisArg?: any): T | undefined
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: T, index: number, view: IArrayView<T>) => unknown, thisArg?: any): number
    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: T, index: number, view: IArrayView<T>) => void, thisArg?: any): void
    /**
     * Calls a defined callback function on each element of an array. Then, flattens the result into
     * a new array.
     * This is identical to a map followed by flat with depth 1.
     *
     * @param callback A function that accepts up to three arguments. The flatMap method calls the
     * callback function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callback function. If
     * thisArg is omitted, undefined is used as the this value.
     */
    forEachAsync(callbackfn: (value: T, index: number, view: IArrayView<T>) => Promise<void>, thisArg?: any): Promise<void>
    /**
     * Calls a defined callback function on each element of an array. Then, flattens the result into
     * a new array.
     * This is identical to a map followed by flat with depth 1.
     *
     * @param callback A function that accepts up to three arguments. The flatMap method calls the
     * callback function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callback function. If
     * thisArg is omitted, undefined is used as the this value.
     */
    flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, view: IArrayView<T>) => U | ReadonlyArray<U>, thisArg?: This): U[]
    /**
     * Calls a defined callback function on each element of a view, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the view.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T, index: number, view: IArrayView<T>) => U, thisArg?: any): U[]
    mapAsync<U>(callbackfn: (value: T, index: number, view: IArrayView<T>) => Promise<U>, thisArg?: any): Promise<U[]>
    /**
     * Calls the specified callback function for all the elements in aa voew. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => T): T
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => T, initialValue: T): T
    /**
     * Calls the specified callback function for all the elements in a view. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, view: IArrayView<T>) => U, initialValue: U): U
    /**
     * Calls the specified callback function for all the elements in aa voew. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduceAsync(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => T | Promise<T>): Promise<T>
    reduceAsync(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => T | Promise<T>, initialValue: T): Promise<T>
    /**
     * Calls the specified callback function for all the elements in a view. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduceAsync<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, view: IArrayView<T>) => U | Promise<U>, initialValue: U): Promise<U>
    /**
     * Returns a new view with start and end set in the context of the current view.
     * @param start The beginning of the specified portion of the view.
     * @param end The end of the specified portion of the view. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): IArrayView<T>
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => T): T
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => T, initialValue: T): T
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, view: IArrayView<T>) => U, initialValue: U): U
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRightAsync(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => Promise<T>): Promise<T>
    reduceRightAsync(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, view: IArrayView<T>) => Promise<T>, initialValue: T): Promise<T>
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRightAsync<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, view: IArrayView<T>) => Promise<U>, initialValue: U): Promise<U>
    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: T, index: number, view: IArrayView<T>) => unknown, thisArg?: any): boolean

    /**
     * Render the view as an array.
     */
    toArray(): T[]

    [Symbol.asyncIterator](): AsyncIterableIterator<T>
}
