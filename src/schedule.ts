type Fn<T> = () => T
type MaybePromise<T> = () => Promise<T> | T
type PromiseFn<T> = () => Promise<T>

function timeout(ms: number): Promise<void> {
    return new Promise(resolve => void setTimeout(resolve, ms))
}

function immediate(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve))
}

type ScheduleFn = (fn: MaybePromise<void>) => Promise<void>

interface IScheduler {
    schedule: (fn: MaybePromise<void>) => Promise<void>
}

class TimeoutScheduler implements IScheduler {
    constructor(private ms = 0) {}

    async schedule(fn: MaybePromise<void>) {
        await timeout(this.ms)
        await fn()
    }
}

class ImmediateScheduler implements IScheduler {
    async schedule(fn: MaybePromise<void>) {
        await immediate()
        await fn()
    }
}

export class Schedule {
    constructor() {
        if (new.target != null) throw new Error('class is static')
    }

    static readonly Timeout = async <T>(ms: number, fn: MaybePromise<T>): Promise<T> => {
        await timeout(ms)
        return await fn()
    }

    static readonly Soon = async <T>(fn: MaybePromise<T>): Promise<T> => {
        await timeout(0)
        return await fn()
    }

    static readonly Immediate = async <T>(fn: MaybePromise<T>): Promise<T> => {
        await immediate()
        return await fn()
    }

    static readonly Sync = async <T>(fn: Fn<T>): Promise<T> => {
        return fn()
    }

    static readonly When = async <T>(fn: MaybePromise<T>, when: PromiseFn<void>): Promise<T> => {
        await when()
        return await fn()
    }
}
