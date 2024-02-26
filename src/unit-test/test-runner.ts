import { inspect } from 'util'
import { IResultSummary, IUnitTest, ResultType } from './types'
import { skipLogic } from './skip-logic'

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
        this.report(results)
    }

    private report(results: ResultType[]) {
        // console.log(inspect(results, { colors: true, depth: 5, sorted: true }))
        console.log(this.summary(results))
    }

    private summary(results: ResultType[]): IResultSummary {
        const summary = { description: this.description, passed: 0, failed: 0, skipped: 0, total: 0 }

        for (const r of results) {
            summary.passed += r.passed
            summary.failed += r.failed
            summary.skipped += r.skipped
            summary.total += r.total
        }
        return summary
    }
}
