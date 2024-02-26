import { IUnitTest } from './types'

export type SkipFn = (test: IUnitTest) => boolean

export function skipLogic(tests: readonly IUnitTest[], skip = false): SkipFn {
    if (skip) {
        return () => true
    } else {
        const only = new Set(tests.filter(t => t.only))
        return (t: IUnitTest) => skip || (only.size > 0 && !only.has(t))
    }
}
