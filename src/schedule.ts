import { Observable, Subject } from './observable'

type Fn<T> = () => T
type MaybePromise<T> = () => Promise<T> | T
type PromiseFn<T> = () => Promise<T>

function timeout(ms: number): Promise<void> {
    return new Promise(resolve => void setTimeout(resolve, ms))
}

function immediate(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve))
}

interface IScheduler {
    schedule: <T>(fn: MaybePromise<T>) => Promise<T>
}

export class Scheduler {
    constructor() {
        if (new.target != null) throw new Error('class is static')
    }

    static timeout(ms: number) {
        return new TimeoutScheduler(ms)
    }

    static immediate() {
        return new ImmediateScheduler()
    }

    static sync() {
        return new SyncScheduler()
    }

    static when(when: PromiseFn<void>) {
        return new WhenScheduler(when)
    }

    static controlled(observable: Observable<boolean>) {
        return new ControlledScheduler(observable)
    }
}

export class ControlSubject extends Subject<boolean> {
    notify(run: boolean): void {
        super.notify(run)
    }
}

class TimeoutScheduler extends Scheduler implements IScheduler {
    constructor(private ms: number) {
        super()
    }

    async schedule<T>(fn: MaybePromise<T>) {
        await timeout(this.ms)
        return await fn()
    }
}

class ImmediateScheduler extends Scheduler implements IScheduler {
    async schedule<T>(fn: MaybePromise<T>) {
        await immediate()
        return await fn()
    }
}

class SyncScheduler extends Scheduler implements IScheduler {
    schedule<T>(fn: Fn<T>) {
        return Promise.resolve(fn())
    }
}

class WhenScheduler extends Scheduler implements IScheduler {
    constructor(private readonly when: PromiseFn<void>) {
        super()
    }

    async schedule<T>(fn: MaybePromise<T>) {
        await this.when()
        return await fn()
    }
}

class ControlledScheduler extends Scheduler implements IScheduler {
    constructor(private readonly observable: Observable<boolean>) {
        super()
    }

    async schedule<T>(fn: MaybePromise<T>) {
        return new Promise<T>(resolve => {
            const disposer = this.observable.subscribe(async run => {
                if (run) {
                    const result = await fn()
                    disposer()
                    resolve(result)
                }
            })
        })
    }
}

// export class Schedule {
//     constructor() {
//         if (new.target != null) throw new Error('class is static')
//     }

//     static readonly Timeout = async <T>(ms: number, fn: MaybePromise<T>): Promise<T> => {
//         await timeout(ms)
//         return await fn()
//     }

//     static readonly Soon = async <T>(fn: MaybePromise<T>): Promise<T> => {
//         await timeout(0)
//         return await fn()
//     }

//     static readonly Immediate = async <T>(fn: MaybePromise<T>): Promise<T> => {
//         await immediate()
//         return await fn()
//     }

//     static readonly Sync = async <T>(fn: Fn<T>): Promise<T> => {
//         return fn()
//     }

//     static readonly When = async <T>(fn: MaybePromise<T>, when: PromiseFn<void>): Promise<T> => {
//         await when()
//         return await fn()
//     }
// }
