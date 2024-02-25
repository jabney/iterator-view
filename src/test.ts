import assert from 'assert'
import { arrayView } from './array-view'

export type TestFn = <T>(test: TestLib) => (T | void) | Promise<T | void>

class TestResult {
    constructor(
        readonly desc: string,
        readonly result: unknown
    ) {}

    get passed() {
        return !(this.result instanceof Error)
    }

    get failed() {
        return !this.passed
    }
}

const errMsg = (error: string, msg?: string | null) => {
    return msg ? `(${msg}) ${error}` : error
}

class TestLib {
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

interface Options {
    only?: boolean
    skip?: boolean
}

export class Test {
    static readonly test = (desc: string, fn: TestFn): Test => {
        return new Test(desc, fn)
    }

    static readonly only = (desc: string, fn: TestFn): Test => {
        return new Test(desc, fn, { only: true })
    }

    static readonly skip = (desc: string, fn: TestFn): Test => {
        return new Test(desc, fn, { skip: true })
    }

    constructor(
        readonly desc: string,
        private readonly fn: TestFn,
        private readonly options: Options = {}
    ) {}

    get only() {
        return this.options?.only ?? false
    }

    get skip() {
        return this.options?.skip ?? false
    }

    async run(): Promise<TestResult> {
        try {
            const result = await this.fn(new TestLib())
            return new TestResult(this.desc, result)
        } catch (e) {
            return new TestResult(this.desc, e)
        }
    }
}

export const run = async (title: string, tests: Test[]) => {
    const only = tests.filter(t => t.only)
    const t = only.length > 0 ? only : tests
    const results = await Promise.all(t.filter(x => !x.skip).map(t => t.run()))

    console.log(`${title}`)
    console.log(`${'-'.repeat(title.length)}\n`)

    for (const r of results) {
        if (r.passed) {
            console.log(`  passed -- ${r.desc}`)
        } else {
            console.log(`  FAILED -- ${r.desc} <${r.result}>`)
        }
    }

    const failed = results.filter(x => x.failed).length
    const passed = results.length - failed

    console.log()
    if (passed > 0) console.log(`  ${passed} tests passed`)
    if (failed > 0) console.log(`  ${failed} tests failed`)
    console.log()
    return { passed, failed, total: results.length }
}

const runAll = async () => {
    /**
     *
     */
    const results = await Promise.all([
        run('Array View Core', [
            Test.test('View Creation', t => {
                const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                const view = arrayView(array)
                t.equals(array.length, view.length, 'array and view length are the same')
            }),
            Test.test('View Bounds from start', t => {
                const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
                const view = arrayView(array, 1)
                t.equals(array.length - 1, view.length, 'view length is 1 less than array length')
                t.equals('b', view[0])
                t.equals('j', view[view.length - 1])
            }),
            Test.test('View Bounds from start and end', t => {
                const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
                const view = arrayView(array, 1, -1)
                t.equals(array.length - 2, view.length, 'view length is 2 less than array length')
                t.equals('b', view[0])
                t.equals('i', view[view.length - 1])
            }),
        ]),

        /**
         *
         */
        run('Array View Methods', [
            Test.test('Slice from start', t => {
                const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

                const a = arrayView(array)
                t.equals(array.length, a.length, 'array and view length are the same')

                const b = a.slice(0)
                t.equals(a.length, b.length, 'views a and b are same length')

                const c = b.slice(1)
                t.equals(b.length - 1, c.length, 'view c is 1 less than view b')
                t.equals('b', c[0], 'first element of view b was trimmed')
                t.equals('j', c[c.length - 1], ' cend element is unchanged')

                const d = c.slice(1)
                t.equals(c.length - 1, d.length, 'view d is 1 less than view c')
                t.equals('c', d[0], 'd first element was trimmed')
                t.equals('j', d[d.length - 1], 'end element is unchanged')
            }),
            Test.test('Slice from end', t => {
                const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

                const a = arrayView(array)
                t.equals(array.length, a.length, 'view and array are same length')

                const b = a.slice(0, a.length)
                t.equals(a.length, b.length, 'views a and b are same length')

                const c = b.slice(1, -1)
                t.equals(b.length - 2, c.length, 'view c is 2 less than view b')
                t.equals('b', c[0], 'first element of view b was trimmed')
                t.equals('i', c[c.length - 1], 'end element of view b was trimmed')

                const d = c.slice(1, -1)
                t.equals(c.length - 2, d.length, 'view d is 2 less than view c')
                t.equals('c', d[0], 'first element of view c was trimmed')
                t.equals('h', d[d.length - 1], 'end element of view c was trimmed')
            }),
        ]),
    ])

    const r = results.reduce((a, b) => ({
        passed: a.passed + b.passed,
        failed: a.failed + b.failed,
        total: a.total + b.total,
    }))

    console.log()
    console.log('ALL TESTS')
    console.log('---------')
    if (r.passed > 0) console.log(`  ${r.passed} tests passed`)
    if (r.failed > 0) console.log(`  ${r.failed} tests failed`)
    console.log()
}

runAll()
