import assert from 'assert'

export class TestLib {
    private sign = true

    constructor() {}

    get not(): this {
        this.sign = !this.sign
        return this
    }

    equals<T>(expected: T, actual: T, message = '') {
        if (this.sign) {
            const msg = errMsg(`expected "${expected as T}" to equal "${actual}"`, message)
            assert.deepStrictEqual(actual, expected, msg)
        } else {
            const msg = errMsg(`expected "${expected as T}" to not equal "${actual}"`, message)
            assert.notDeepStrictEqual(actual, expected, msg)
        }
    }
}

const errMsg = (error: string, msg?: string | null) => {
    return msg ? `(${msg}) ${error}` : error
}
