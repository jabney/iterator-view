import { Color } from './color'
import { IResultSummary, ITestSummary, SummaryTotals, TestResult } from './types'

const c = Color

export const formatResults = ({ description, results, totals }: ITestSummary, indent = 4) => {
    const output: string[] = [description, '-'.repeat(description.length), '']

    for (const r of results) {
        output.push(...visitResult(r, indent, 1))
    }

    output.push(...formatTotals(totals))

    return `\n${output.join('\n')}\n`
}

const visitResult = (item: TestResult, indent: number, depth: number): string[] => {
    const pad = padding(indent, depth)
    const output: string[] = []

    switch (item.type) {
        case 'aggregate-result':
            if (item.failed > 0) {
                output.push(pad(c.red(item.description).str))
            } else if (item.skipped > 0) {
                if (item.skipped === item.results.length) {
                    output.push(pad(c.gray(item.description).str))
                } else {
                    output.push(pad(item.description))
                }
            } else {
                console.log('PASSED')
                output.push(pad(c.green(item.description).str))
            }
            for (const r of item.results) {
                output.push(...visitResult(r, indent, depth + 1))
            }
            break
        case 'test-result':
            if (item.error instanceof Error) {
                output.push(pad(c.red(item.error.stack ?? item.error.message).str))
            } else {
                output.push(pad(item.description))
            }
            break
        case 'skipped-result':
            output.push(pad(c.gray(item.description).str))
            break
    }
    return output
}

const padding = (indent: number, depth: number) => {
    const rePad = /\n( {4})/g
    const pad = ' '.repeat(indent * depth)
    return (str: string) => `${pad}${str.replace(rePad, `\n${pad}$1`)}`
}

const formatTotals = ({ passed, failed, skipped, total }: SummaryTotals): string[] => {
    return [
        `Summary:`,
        passed > 0 && c.green(`- Passed: ${passed}`).str,
        failed > 0 && c.red(`- Failed: ${failed}`).str,
        skipped > 0 && c.gray(`- Skipped: ${skipped}`).str,
        c.bright(`Total: ${total}`).str,

        failed === 0 ? `\n${c.br.green(`All tests passed`)}` : `\n${c.br.red(`${failed} test${failed != 1 ? 's' : ''} failed`)}`,
    ].filter((x): x is string => typeof x === 'string')
}
