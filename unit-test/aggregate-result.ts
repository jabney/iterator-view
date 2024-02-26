import { resultObject } from './result-object'
import { IAggregateResult, IResultSummary, TestResult } from './types'

export class AggregateResult implements IAggregateResult {
    readonly type = 'aggregate-result'

    private _passed: number | null = null
    private _failed: number | null = null
    private _skipped: number | null = null
    private _total: number | null = null

    constructor(
        readonly description: string,
        readonly results: TestResult[]
    ) {}

    get passed(): number {
        if (this._passed == null) {
            this._passed = this.results.reduce((total, r) => total + r.passed, 0)
        }
        return this._passed
    }

    get failed(): number {
        if (this._failed == null) {
            this._failed = this.results.reduce((total, r) => total + r.failed, 0)
        }
        return this._failed
    }

    get skipped(): number {
        if (this._skipped == null) {
            this._skipped = this.results.reduce((total, r) => total + r.skipped, 0)
        }
        return this._skipped
    }

    get total(): number {
        if (this._total == null) {
            this._total = this.results.reduce((total, r) => total + r.total, 0)
        }
        return this._total
    }

    toJSON(): IResultSummary {
        return resultObject(this)
    }
}
