import assert from 'assert'
import { arrayView } from './array-view'

let list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.log('list length:', list.length, '\n')

const view1 = arrayView(list)
for (const x of view1) {
    console.log('jimmy view1:', x)
}
console.log('view1 length:', view1.length, '\n')

const view2 = arrayView(list, 1, 10)
for (const x of view2) {
    console.log('jimmy view2:', x)
}
console.log('view2 length:', view2.length, '\n')

const view3 = view2.slice(2, 9)
for (const x of view3) {
    console.log('jimmy view3:', x)
}
console.log('view3 length:', view3.length, '\n')

for (const x of view3) {
    console.log('item:', x)
}
console.log('\n')

for (let i = 0; i < view3.length; i++) {
    console.log(`item at ${i}:`, view3[i])
}
console.log('\n')

export type TestFn = <T>(test: TestLib) => (T | void) | Promise<T | void>

class TestResult {
    constructor(
        readonly desc: string,
        readonly result: unknown
    ) {}

    get passed() {
        return !(this.result instanceof Error)
    }
}

class TestLib {
    constructor(private readonly desc: string) {}

    equals<T>(actual: T, expected: T) {
        if (typeof actual !== typeof expected) {
            throw new Error(`"Type mismatch "${typeof actual}" !== "${typeof expected}"`)
        }

        switch (typeof expected) {
            case 'number':
            case 'string':
            case 'boolean':
            case 'symbol':
            case 'undefined':
                assert(actual === expected, `expected "${expected as T}" to equal "${actual as T}"`)
                break
            case 'object':
                if (Array.isArray(actual)) {
                    assert(Array.isArray(expected), `expected "${expected}" to be an array`)
                    assert.deepStrictEqual(actual, expected, `expected "${expected}" to deeply equal "${actual}"`)
                } else if (actual == null) {
                    assert(expected == null, `expected "${expected}" to be "${typeof actual}"`)
                } else {
                    assert.deepStrictEqual(actual, expected, `expected "${expected}" to deeply equal "${actual}"`)
                }
                break
            default:
                throw new Error(`could not compare type "${typeof expected}"`)
        }
    }
}

export class Test {
    static readonly test = (desc: string, fn: TestFn): Test => {
        const test = new Test(desc, fn)
        return test
    }

    constructor(
        readonly desc: string,
        private readonly fn: TestFn
    ) {}

    async run(): Promise<TestResult> {
        try {
            const result = await this.fn(new TestLib(this.desc))
            return new TestResult(this.desc, result)
        } catch (e) {
            return new TestResult(this.desc, e)
        }
    }
}

const run = async (tests: Test[]) => {
    const passed: TestResult[] = []
    const failed: TestResult[] = []

    for (const t of tests) {
        const result = await t.run()
        if (result.passed) {
            passed.push(result)
        } else {
            failed.push(result)
        }
    }

    if (passed.length > 0) {
        for (const r of passed) {
            console.log(`  ${r.desc} -- passed`)
        }
    }
    if (failed.length > 0) {
        for (const r of failed) {
            console.log(`\n  ${r.desc} -- failed`)
            console.log(`  ${r.result}\n`)
        }
    }
    console.log(`${passed.length} tests passed`)
    console.log(`${failed.length} tests failed`)
}

run([
    Test.test('Testy test1', test => test.equals(0, 1)),
    Test.test('Testy test2', test => test.equals(0, 0)),
    Test.test('Testy test3', test => test.equals(0, 0)),
])
