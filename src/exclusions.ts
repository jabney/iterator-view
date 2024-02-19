const disallowed: (symbol | string)[] = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

const notImplemented: (symbol | string)[] = [
    // "at",
    'concat',
    'copyWithin',
    // "entries",
    'every',
    'fill',
    // "filter",
    'find',
    'findIndex',
    'findLast',
    'findLastIndex',
    'flat',
    'flatMap',
    'forEach',
    'includes',
    'indexOf',
    'join',
    // "keys",
    'lastIndexOf',
    // "map",
    // "reduce",
    'reduceRight',
    // "slice",
    'some',
    'toLocaleString',
    'toReversed',
    'toSorted',
    'toSpliced',
    'toString',
    // "values",
    'with',
]

export const excluded = new Map<string | symbol, true>([...disallowed, ...notImplemented].map(key => [key, true]))