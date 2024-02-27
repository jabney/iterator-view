import { Color } from './color'
import { ITestSummary, SummaryTotals, TestResult } from './types'

const c = Color

export const formatResults = ({ description, results, totals }: ITestSummary, indent = 4) => {
    const desc = c.underscore(description)
    const output: string[] = [desc.str, '']

    for (const r of results) {
        output.push(...visitResult(r, indent, 1))
    }

    output.push(...formatTotals(totals))

    return `\n${output.join('\n')}\n`
}

const visitResult = (item: TestResult, indent: number, depth: number): string[] => {
    const pad = padding(indent, depth)
    c
    const output: string[] = []

    switch (item.type) {
        case 'aggregate-result':
            const desc = c.text(`${item.description}\n`)
            const allSkipped = item.skipped > 0 && item.skipped === item.results.length
            output.push(pad(allSkipped ? desc.gray.str : desc.str))

            for (const r of item.results) {
                output.push(...visitResult(r, indent, depth + 1))
            }
            output.push(...formatSection(item).map(x => pad(x)))
            output.push('')
            break
        case 'test-result':
            if (item.error instanceof Error) {
                const _pad = padding(indent, depth + 1)
                output.push(pad(c.red(item.description).str), '')
                output.push(_pad(c.red(item.error.stack ?? item.error.message).str), '')
            } else {
                output.push(pad(c.green(item.description).str))
            }
            break
        case 'skipped-result':
            output.push(pad(c.gray(item.description).str))
            // output.push('')
            break
    }
    return output
}

const padding = (indent: number, depth: number) => {
    const pad = inset(indent)
    const re = /\n( {4})/g
    const rep = `\n${pad(depth)}$1`
    return (str: string, d = 0) => `${pad(depth + d)}${str.replace(re, rep)}`
}

const inset = (indent: number) => {
    return (depth = 1) => ' '.repeat(depth * indent)
}

const formatTotals = ({ passed, failed, skipped, total }: SummaryTotals): string[] => {
    const br = c.br
    return [
        `Summary:`,
        passed > 0 && c.green(`- Passed: ${passed}`).str,
        failed > 0 && c.red(`- Failed: ${failed}`).str,
        skipped > 0 && c.gray(`- Skipped: ${skipped}`).str,
        c.bright(`Total: ${total}`).str,

        failed === 0
            ? `\n${br.text(`All tests passed`).green}`
            : `\n${br.text(`${failed} test${failed != 1 ? 's' : ''} failed`).red}`,
    ].filter((x): x is string => typeof x === 'string')
}

const formatSection = ({ passed, failed, skipped, total }: SummaryTotals): string[] => {
    return [
        `Summary:`,
        passed > 0 && c.green(`- Passed: ${passed}`).str,
        failed > 0 && c.red(`- Failed: ${failed}`).str,
        skipped > 0 && c.gray(`- Skipped: ${skipped}`).str,
        `  Total: ${total}`,
    ].filter((x): x is string => typeof x === 'string')
}
