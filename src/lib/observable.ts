import { createOptions } from './options'

export type Observer<T> = (value: T) => void
export type Observers<T> = Set<Observer<T>>
export type Disposer = () => void

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

export interface IObservable<T> {
    readonly value: T | undefined
    subscribe(observer: Observer<T>): Disposer
}

export class Observable<T> implements IObservable<T> {
    protected readonly observers: Set<Observer<T>>
    protected readonly options: IOptions
    protected _value?: T = undefined

    constructor()
    constructor(options: Options)
    constructor(options: Options, observers: Observers<T>)
    constructor(options?: Options, observers?: Observers<T> | null) {
        this.options = getOptions(options)
        this.observers = observers ?? new Set<Observer<T>>()
    }

    get value() {
        return this._value
    }

    subscribe = (observer: Observer<T>): Disposer => {
        this.observers.add(observer)
        if (this._value !== undefined) {
            observer(this._value)
        }
        return () => void this.observers.delete(observer)
    }
}

export abstract class Subject<T> extends Observable<T> {
    notify(value: T): void {
        this._value = value
        for (const observer of this.observers) {
            observer(value)
        }
    }

    asObservable(): Observable<T> {
        return new Observable(this.options, this.observers)
    }
}
