import { createOptions } from './options'

type NextFn<T> = (value: T) => void
type CompleteFn = () => void
type ErrorFn = (e: any) => void

export interface IObserver<T> {
    readonly next: NextFn<T>
    readonly complete?: CompleteFn
    readonly error?: ErrorFn
}

export class Observer<T> implements IObserver<T> {
    constructor(
        readonly next: NextFn<T>,
        readonly complete?: CompleteFn,
        readonly error?: ErrorFn
    ) {}
}

export type ObserverFn<T> = NextFn<T>
export type ObserverType<T> = IObserver<T> | ObserverFn<T>
export type Observers<T> = Set<IObserver<T>>
export type Unsubscribe = () => void

export interface IObservable<T> {
    readonly value: T | undefined
    readonly isComplete: boolean
    readonly hasError: boolean
    readonly exception: Error | null
    subscribe(observer: ObserverType<T>): Unsubscribe
}

function createError(error: any) {
    const msg = error?.stack ?? error?.message ?? error?.toString?.()
    return new Error(msg ?? 'unknown error')
}

class ObservableError extends Error {
    constructor(readonly error: any) {
        const e = error instanceof Error ? error : createError(error)
        super(e.message)
    }
}

interface IOptions {
    /**
     * Notify new subscribers immediately if the observable has a value.
     */
    readonly notifyNew: boolean
}

type Options = Partial<IOptions>

const getOptions = createOptions<IOptions>({
    notifyNew: true,
})

const unsubscribe = <T>(observers: Observers<T>) => {
    return (observer: IObserver<T>) => () => {
        observers.delete(observer)
    }
}

export const createObserver = <T>(o: ObserverType<T>) => {
    if (typeof o === 'function') {
        return new Observer(o)
    }
    return new Observer(o.next, o.complete, o.error)
}

export class Observable<T> implements IObservable<T> {
    protected readonly observers: Set<IObserver<T>>
    protected readonly options: IOptions
    private readonly unsub: (observer: IObserver<T>) => Unsubscribe

    private _value: T | undefined = undefined
    private _complete = false
    private _exception: Error | null = null

    constructor()
    constructor(options: Options)
    constructor(options: Options, observers: Observers<T>, value: T | undefined)
    constructor(options?: Options, observers?: Observers<T> | null, value?: T) {
        this.options = getOptions(options)
        this.observers = observers ?? new Set<IObserver<T>>()
        this.unsub = unsubscribe(this.observers)
        this._value = value
    }

    get value(): T | undefined {
        return this._value
    }

    protected set value(v: T) {
        this._value = v
    }

    get isComplete(): boolean {
        return this._complete || this._exception != null
    }

    protected set isComplete(v: boolean) {
        this._complete = v
    }

    get hasError(): boolean {
        return this._exception != null
    }

    get exception(): Error | null {
        return this._exception
    }

    protected set exception(e: Error) {
        this._exception = e
    }

    subscribe = (observer: ObserverType<T>): Unsubscribe => {
        const o = createObserver(observer)
        const disposer = this.unsub(o)

        if (this._value !== undefined && this.options.notifyNew) {
            o.next(this._value)
        }

        if (this.isComplete) {
            o.complete?.()
            return disposer
        }

        if (this.hasError) {
            o.error?.(this._exception)
            return disposer
        }

        this.observers.add(o)

        return disposer
    }
}

export class Subject<T> extends Observable<T> implements IObserver<T> {
    static from<T>(it: Iterable<T>): Subject<T> {
        const subject = new Subject<T>()
        subject.init(it)
        return subject
    }

    static fromAsync<T>(it: AsyncIterable<T>): Subject<T> {
        const subject = new Subject<T>()
        subject.initAsync(it)
        return subject
    }

    private init(it: Iterable<T>) {
        for (const v of it) this.next(v)
        this.complete()
    }

    private async initAsync(it: AsyncIterable<T>) {
        for await (const v of it) this.next(v)
        this.complete()
    }

    next(value: T): void {
        this.value = value
        for (const o of this.observers) {
            o.next(value)
        }
    }

    complete = () => {
        this.isComplete = true
        for (const o of this.observers) {
            o.complete?.()
        }
    }

    error(e: any) {
        this.exception = new ObservableError(e)
        for (const o of this.observers) {
            o.error?.(this.exception)
        }
    }

    asObservable(): Observable<T> {
        return new Observable(this.options, this.observers, this.value)
    }
}
