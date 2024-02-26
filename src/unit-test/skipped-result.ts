import { ISkippedResult } from './types'

export class SkippedResult implements ISkippedResult {
    readonly type = 'skipped-result'
    readonly passed = 0
    readonly failed = 0
    readonly total = 1

    constructor(
        readonly description: string,
        readonly skipped = 1
    ) {}
}
