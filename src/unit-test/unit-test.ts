import { TestLib } from './test-lib'

export class TestResult {
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

export type TestFn = <T>(test: TestLib) => (T | void) | Promise<T | void>

export interface TestState {
    only?: boolean
    skip?: boolean
}

export class UnitTest {
    static readonly test = (desc: string, fn: TestFn): UnitTest => {
        return new UnitTest(desc, fn)
    }

    static readonly only = (desc: string, fn: TestFn): UnitTest => {
        return new UnitTest(desc, fn, { only: true })
    }

    static readonly skip = (desc: string, fn: TestFn): UnitTest => {
        return new UnitTest(desc, fn, { skip: true })
    }

    private readonly _state: Readonly<TestState>

    constructor(
        readonly desc: string,
        private readonly fn: TestFn,
        state: TestState = {}
    ) {
        this._state = {
            only: Boolean(state.only ?? false),
            skip: Boolean(state.skip ?? false),
        }
    }

    get only() {
        return this._state?.only ?? false
    }

    get skip() {
        return this._state?.skip ?? false
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
