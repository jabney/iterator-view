import { IResultSummary, IUnitTest, TestResult } from './types'
import { skipLogic } from './skip-logic'
import { resultObject } from './result-object'
import { inspect } from 'util'

type Totals = Omit<IResultSummary, 'type'>

interface ISummary {
    description: string
    summaries: IResultSummary[]
    totals: Totals
}

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
        const report = this.report(results)

        console.log(inspect(report, { colors: true, depth: 5, sorted: false }))
    }

    private report(results: TestResult[]): ISummary {
        const description = this.description
        const summaries = results.map(createSummary)
        const totals = this.totals(results)
        return { description, summaries, totals }
    }

    private totals(results: TestResult[]): Totals {
        const t = { description: this.description, passed: 0, failed: 0, skipped: 0, total: 0 }
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
