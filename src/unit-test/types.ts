export interface IResultSummary {
    readonly description: string
    readonly passed: number
    readonly failed: number
    readonly skipped: number
    readonly total: number
}

export interface ITestResult extends IResultSummary {
    readonly type: 'test-result'
    readonly error: Error | null
}

export interface IAggregateResult extends IResultSummary {
    readonly type: 'aggregate-result'
    readonly results: ResultType[]
}

export interface ISkippedResult extends IResultSummary {
    readonly type: 'skipped-result'
}

export type ResultType = ITestResult | IAggregateResult | ISkippedResult

export interface IUnitTest {
    readonly description: string
    readonly only: boolean
    readonly skip: boolean
    run(skip?: boolean): Promise<ResultType>
}
