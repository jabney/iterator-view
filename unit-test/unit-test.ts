import { SkippedResult } from './skipped-result'
import { TestLib } from './lib'
import { UnitResult } from './test-result'
import { IUnitTest, TestResult } from './types'

type TestFn = (test: TestLib) => unknown | Promise<unknown>

interface TestState {
    readonly only: boolean
    readonly skip: boolean
}

interface Options {
    readonly only?: boolean
    readonly skip?: boolean
}

export class UnitTest implements IUnitTest {
    static readonly test = (desc: string, fn: TestFn): UnitTest => {
        return new UnitTest(desc, fn)
    }

    static readonly only = (desc: string, fn: TestFn): UnitTest => {
        return new UnitTest(desc, fn, { only: true })
    }

    static readonly skip = (desc: string, fn: TestFn): UnitTest => {
        return new UnitTest(desc, fn, { skip: true })
    }

    private readonly state: Readonly<TestState>

    constructor(
        readonly description: string,
        private readonly fn: TestFn,
        state: Options = {}
    ) {
        this.state = Object.freeze({
            only: Boolean(state.only ?? false),
            skip: Boolean(state.skip ?? false),
        })
    }

    get only() {
        return this.state.only
    }

    get skip() {
        return this.state.skip
    }

    async run(skip = false): Promise<TestResult> {
        if (skip || this.skip) {
            return new SkippedResult(this.description)
        }
        try {
            await this.fn(new TestLib())
            return new UnitResult(this.description)
        } catch (e: any) {
            const error = e instanceof Error ? e : new Error(e?.toString?.() ?? 'unknown error')
            return new UnitResult(this.description, error)
        }
    }
}
