import { IResultSummary, ITestSummary, IUnitTest, SummaryTotals, TestResult } from './types'
import { skipLogic } from './skip-logic'
import { resultObject } from './result-object'
import { inspect } from 'util'
import { formatResults } from './result-formatter'

export class TestRunner {
    static readonly run = async (desc: string, tests: IUnitTest[]) => {
        await new TestRunner(desc, tests).run()
    }

    constructor(
        readonly description: string,
        private readonly tests: readonly IUnitTest[]
    ) {}

    private async run(): Promise<void> {
        const skipTest = skipLogic(this.tests)
        const results = await Promise.all(this.tests.map(t => t.run(skipTest(t))))
        const summary = this.report(results)

        // console.log(inspect(summary, { colors: true, depth: 5, sorted: false }))
        console.log(formatResults(summary))
    }

    private report(results: TestResult[]): ITestSummary {
        const description = this.description
        const items = results.map(createSummary)
        const totals = this.totals(results)
        return { description, items, totals }
    }

    private totals(results: TestResult[]): SummaryTotals {
        const t = { passed: 0, failed: 0, skipped: 0, total: 0 }
        for (const r of results) {
            t.passed += r.passed
            t.failed += r.failed
            t.skipped += r.skipped
            t.total += r.total
        }
        return t
    }
}

const createSummary = (result: TestResult): IResultSummary => {
    return resultObject(result)
}
