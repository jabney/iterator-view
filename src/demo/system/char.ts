/**
 * Unicode code points range from 0 to 1114111 (0x10FFFF).
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
 */
import { ValueError } from './error'

const uMax = 0x10ffff

//
export class Char {
    private readonly code: number

    constructor(code: number)
    constructor(char: string)
    constructor(value: number | string) {
        const code = typeof value === 'number' ? Math.trunc(value) : value.codePointAt(0)

        if (!(code != null && 0 <= code && code <= uMax)) {
            throw new ValueError(value)
        }
        this.code = code
    }

    get str() {
        return this.sanitize()
    }

    toString() {
        return this.sanitize()
    }

    private isPrintable() {
        return this.code >= 0x20 && this.code < 0x80 // [32, 127]
    }

    private sanitize() {
        return this.isPrintable() ? String.fromCharCode(this.code) : ' '
    }
}
