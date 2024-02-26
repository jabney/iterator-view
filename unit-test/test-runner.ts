import { ITestSummary, IUnitTest, SummaryTotals, TestResult } from './types'
import { skipLogic } from './skip-logic'
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
        const totals = this.totals(results)
        return { description, results, totals }
    }

    private totals(results: TestResult[]): SummaryTotals {
        const totals = { passed: 0, failed: 0, skipped: 0, total: 0 }
        for (const r of results) {
            totals.passed += r.passed
            totals.failed += r.failed
            totals.skipped += r.skipped
            totals.total += r.total
        }
        return totals
    }
}
