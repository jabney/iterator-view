import { Nullable } from '../types'
import { Char } from './char'
import { Color } from './color'
import { IComparable } from './comparable'
import { IStringable } from './stringable'

export interface IPixel extends IComparable<IPixel>, IStringable {
    readonly char: Char
    readonly bg?: Color | null
    readonly fg?: Color | null
    readonly str: string
    compareTo(p: IPixel): boolean
}

export class Pixel implements IPixel {
    constructor(char: Char)
    constructor(char: Char, bg: Color)
    constructor(char: Char, bg: Color, fg: Color)
    constructor(
        readonly char: Char,
        readonly bg: Color | null = null,
        readonly fg: Color | null = null
    ) {}

    get str() {
        return `${this.bg ?? ''}${this.fg ?? ''}${this.char}`
    }

    toString() {
        return this.str
    }

    compareTo(other: IPixel) {
        const bg = this.compareColor(this.bg, other.bg)
        const fg = this.compareColor(this.fg, other.fg)
        return bg && fg && this.char.compareTo(other.char)
    }

    private compareColor(a: Nullable<Color>, b: Nullable<Color>): boolean {
        if (a != null) {
            return b == null ? false : a.compareTo(b)
        }
        if (b != null) {
            return a == null ? false : b.compareTo(a)
        }
        return true
    }
}
