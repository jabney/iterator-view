/**
 * Unicode code points range from 0 to 1114111 (0x10FFFF).
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
 */
import { IComparable } from './comparable'
import { ValueError } from './error'
import { IStringable } from './stringable'

export interface IChar {
    readonly code: number
}

export class Char implements IComparable<IChar>, IStringable {
    readonly code: number

    constructor(code: number)
    constructor(char: string)
    constructor(value: number | string) {
        this.code = this.toCode(value)
    }

    get str() {
        return this.sanitize()
    }

    toString() {
        return this.str
    }

    compareTo(other: IChar): boolean {
        return this.code === other.code
    }

    private isValid(code: number): boolean {
        return 0 <= code && code <= 0x10ffff // [0, 1114111]
    }

    private toCode(value: number | string): number {
        const code = typeof value === 'number' ? Math.trunc(value) : value?.codePointAt(0) ?? 0
        if (!this.isValid(code)) {
            throw new ValueError(value)
        }
        return code
    }

    private isPrintable(): boolean {
        return this.code >= 0x20 && this.code < 0x80 // [32, 127]
    }

    private sanitize(): string {
        return this.isPrintable() ? String.fromCharCode(this.code) : ' '
    }
}
