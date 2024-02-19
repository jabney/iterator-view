type Omitted = 'slice' | 'map' | 'filter' | 'reduce'

export type ArrayView<T> = Omit<ReadonlyArray<T>, Omitted> & {
    /**
     * Returns a new view with start and end set in the context of the current view.
     * @param start The beginning of the specified portion of the view.
     * @param end The end of the specified portion of the view. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): ArrayView<T>
    /**
     * Calls a defined callback function on each element of a view, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the view.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T, index: number, view: ArrayView<T>) => U, thisArg?: any): U[]
    mapAsync<U>(callbackfn: (value: T, index: number, view: ArrayView<T>) => Promise<U>, thisArg?: any): Promise<U[]>
    /**
     * Returns the elements of a view that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the view.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter<S extends T>(predicate: (value: T, index: number, array: ArrayView<T>) => value is S, thisArg?: any): S[]
    filterAsync<S extends T>(
        predicate: (value: T, index: number, array: ArrayView<T>) => Promise<boolean>,
        thisArg?: any
    ): Promise<S[]>
    /**
     * Calls the specified callback function for all the elements in aa voew. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: ArrayView<T>) => T): T
    reduce(
        callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: ArrayView<T>) => T,
        initialValue: T
    ): T
    /**
     * Calls the specified callback function for all the elements in a view. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduce<U>(
        callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: ArrayView<T>) => U,
        initialValue: U
    ): U
    /**
     * Calls the specified callback function for all the elements in aa voew. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduceAsync(
        callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: ArrayView<T>) => T | Promise<T>
    ): Promise<T>
    reduceAsync(
        callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: ArrayView<T>) => T | Promise<T>,
        initialValue: T
    ): Promise<T>
    /**
     * Calls the specified callback function for all the elements in a view. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the view.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a view value.
     */
    reduceAsync<U>(
        callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: ArrayView<T>) => U | Promise<U>,
        initialValue: U
    ): Promise<U>
}
