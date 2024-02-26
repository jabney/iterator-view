import { Color } from './color'
import { IResultSummary, ITestSummary, SummaryTotals } from './types'

const c = Color

export const formatResults = ({ description, items, totals }: ITestSummary) => {
    const indent = 4
    const lines = [description, '-'.repeat(description.length), '']

    const recurse = (items: IResultSummary[], depth = 0): string[] => {
        const pad = padding(indent, depth)

        for (const item of items) {
            switch (item.type) {
                case 'aggregate-result':
                    // lines.push(item.description, '')
                    lines.push(...recurse(item.items!, depth + 1))
                default:
                    if (item.error instanceof Error) {
                        lines.push(pad(c.red(item.error.stack ?? item.error.message).str))
                    } else {
                        lines.push(pad(item.description))
                    }
            }
            lines.push('')
        }
        return []
    }

    lines.push(...recurse(items, 1))

    lines.push(...formatTotals(totals))

    return `\n${lines.join('\n')}\n`
}

const padding = (indent: number, depth: number) => {
    const rePad = /\n( +at )/g
    const pad = ' '.repeat(indent * depth)
    return (str: string) => `${pad}${str.replace(rePad, `\n${pad}$1`)}`
}

const formatTotals = ({ passed, failed, skipped, total }: SummaryTotals): string[] => {
    return [
        `Summary:`,
        `${c.green(`- Passed: ${passed}`)}`,
        failed > 0 && c.red(`- Failed: ${failed}`).str,
        skipped > 0 && c.gray(`- Skipped: ${skipped}`).str,
        c.bright(`Total: ${total}`).str,
        passed === total - skipped && `\n${c.br.green(`All tests passed`)}`,
        failed > 0 && `\n${c.br.red(`${failed} test${failed != 1 ? 's' : ''} failed`)}`,
    ].filter((x): x is string => typeof x === 'string')
}
