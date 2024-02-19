type PromiseMaybe<T> = T | Promise<T>
type MaybeFn<T> = () => PromiseMaybe<T>
type PromiseFn<T> = () => Promise<T>

function timeout(ms: number): Promise<void> {
    return new Promise(resolve => void setTimeout(resolve, ms))
}

function immediate(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve))
}

export class Schedule {
    static readonly Timeout = async <T>(ms: number, fn: MaybeFn<T>): Promise<T> => {
        await timeout(ms)
        return await fn()
    }

    static readonly Soon = async <T>(fn: MaybeFn<T>): Promise<T> => {
        await timeout(0)
        return await fn()
    }

    static readonly Immediate = async <T>(fn: MaybeFn<T>): Promise<T> => {
        await immediate()
        return await fn()
    }

    static readonly When = async <T>(fn: MaybeFn<T>, when: PromiseFn<void>): Promise<T> => {
        await when()
        return await fn()
    }
}
