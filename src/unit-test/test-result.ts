import { ITestResult } from './types'

export class TestResult implements ITestResult {
    readonly type = 'test-result'
    readonly skipped = 0
    readonly total = 1

    constructor(
        readonly description: string,
        readonly error: Error | null = null
    ) {}

    get passed(): number {
        return this.error instanceof Error ? 0 : 1
    }

    get failed(): number {
        return 1 - this.passed
    }
}
