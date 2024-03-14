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

export function createObserver<T>(o: ObserverType<T>) {
    if (typeof o === 'function') {
        return new Observer(o)
    }
    return new Observer(o.next, o.complete, o.error)
}

const unsubscribe = <T>(observers: Observers<T>): SubscribeFn<T> => {
    return observer => () => observers.delete(observer)
}

type SubscribeFn<T> = (observer: IObserver<T>) => Unsubscribe

abstract class ObservableBase<T> implements IObservable<T> {
    protected readonly observers: Set<IObserver<T>>

    protected _value: T | undefined = undefined
    protected _complete = false
    protected _exception: Error | null = null

    constructor(observers: Observers<T>) {
        this.observers = observers
    }

    get value(): T | undefined {
        return this._value
    }

    protected set value(v: T | undefined) {
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

    abstract subscribe(observer: ObserverType<T>): Unsubscribe

    protected createObserver<T>(o: ObserverType<T>) {
        return createObserver(o)
    }
}

export class Observable<T> extends ObservableBase<T> {
    // protected readonly options: IOptions

    constructor()
    constructor(observers: Observers<T>, value?: T)
    constructor(observers?: Observers<T> | null, value?: T) {
        super(new Set(observers))
        // this.options = getOptions(options)
        this.value = value
    }

    protected addSubscriber(observer: ObserverType<T>): Unsubscribe {
        const o = this.createObserver(observer)
        const disposer = () => void this.observers.delete(o)

        if (this._value !== undefined) {
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

    subscribe(observer: ObserverType<T>): Unsubscribe {
        return this.addSubscriber(observer)
    }
}

class ProxyObservable<T> extends ObservableBase<T> {
    constructor(observers: Observers<T>)
    constructor(observers: Observers<T>, value?: T) {
        super(observers)
        // this.options = getOptions(options)
        this.value = value
    }

    subscribe(observer: ObserverType<T>): Unsubscribe {
        const o = this.createObserver(observer)
        return () => void this.observers.delete(o)
    }
}

export class Subject<T> extends ObservableBase<T> {
    static from<T>(it: Iterable<T>): Subject<T> {
        const subject = new Subject<T>()
        subject.init(it)
        return subject
    }

    constructor() {
        super(new Set<Observer<T>>())
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

    readonly complete = (): void => {
        this.isComplete = true
        for (const o of this.observers) {
            o.complete?.()
        }
    }

    readonly error = (e: any): void => {
        this.exception = new ObservableError(e)
        for (const o of this.observers) {
            o.error?.(this.exception)
        }
    }

    subscribe(observer: ObserverType<T>) {
        const o = this.createObserver(observer)
        return () => void this.observers.delete(o)
    }

    asObservable(): IObservable<T> {
        return new ProxyObservable(this.observers)
    }
}
