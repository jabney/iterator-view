import { TestResult } from './types'

export const resultObject = (result: TestResult): any => {
    const obj = {
        type: result.type,
        description: result.description,
        passed: result.passed,
        failed: result.failed,
        skipped: result.skipped,
        total: result.total,
    }

    switch (result.type) {
        case 'aggregate-result':
            return { ...obj, results: result.results.map(resultObject) }
        case 'test-result':
            return result.failed ? { ...obj, error: result.error } : obj
        case 'skipped-result':
        default:
            return obj
    }
}
