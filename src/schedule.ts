import { Observable, Subject } from './lib/observable'

type Fn<T> = () => T
type PromiseFn<T> = () => Promise<T> | PromiseLike<T>
type MaybePromise<T> = T | Promise<T> | PromiseLike<T>
type ScheduleFn<T> = () => MaybePromise<T>

export function timeout(ms: number): Promise<void> {
    return new Promise(resolve => void setTimeout(resolve, ms))
}

export function immediate(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve))
}

export interface IScheduler {
    schedule: <T>(fn: ScheduleFn<T>) => Promise<T>
}

export abstract class Scheduler {
    abstract schedule<T>(fn: ScheduleFn<T>): Promise<T>

    static timeout(ms: number): IScheduler {
        return new TimeoutScheduler(ms)
    }

    static soon(): IScheduler {
        return new SoonScheduler()
    }

    static immediate(): IScheduler {
        return new ImmediateScheduler()
    }

    static sync(): IScheduler {
        return new SyncScheduler()
    }

    static when(when: PromiseFn<void>): IScheduler {
        return new WhenScheduler(when)
    }

    static controlled(observable: Observable<boolean>, scheduler = Scheduler.immediate()): IScheduler {
        return new ControlledScheduler(observable, scheduler)
    }

    static default(): IScheduler {
        return this.soon()
    }
}

export class ControlSubject extends Subject<boolean> {
    next(run: boolean): void {
        super.next(run)
    }
}

class TimeoutScheduler extends Scheduler implements IScheduler {
    constructor(private ms: number) {
        super()
    }

    async schedule<T>(fn: ScheduleFn<T>) {
        await timeout(this.ms)
        return await fn()
    }
}

class ImmediateScheduler extends Scheduler implements IScheduler {
    async schedule<T>(fn: ScheduleFn<T>) {
        await immediate()
        return await fn()
    }
}

class SoonScheduler extends Scheduler implements IScheduler {
    async schedule<T>(fn: ScheduleFn<T>) {
        await timeout(0)
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

    async schedule<T>(fn: ScheduleFn<T>) {
        await this.when()
        return await fn()
    }
}

class ControlledScheduler extends Scheduler implements IScheduler {
    constructor(
        private readonly observable: Observable<boolean>,
        private readonly scheduler: Scheduler
    ) {
        super()
    }

    async schedule<T>(fn: ScheduleFn<T>) {
        return new Promise<T>(resolve => {
            const disposer = this.observable.subscribe(async run => {
                if (run) {
                    resolve(await this.scheduler.schedule(fn))
                    disposer()
                }
            })
        })
    }
}
