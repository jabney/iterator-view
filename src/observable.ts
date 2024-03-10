export type Observer<T> = (value: T) => void
export type Observers<T> = Set<Observer<T>>
export type Disposer = () => void

export class Observable<T> {
    protected readonly observers: Set<Observer<T>>
    protected _value?: T = undefined

    constructor()
    constructor(observers: Observers<T>)
    constructor(observers?: Observers<T> | null) {
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
        for (const observer of this.observers) observer(value)
    }

    asObservable(): Observable<T> {
        return new Observable(this.observers)
    }
}
