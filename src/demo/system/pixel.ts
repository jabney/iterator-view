import { Nullable } from '../types'
import { Char, IChar } from './char'
import { Color } from './color'
import { IComparable } from './comparable'
import { IStringable } from './stringable'

export interface IPixel extends IComparable<IPixel>, IStringable {
    readonly char: IChar
    readonly bgc?: Color | null
    readonly fgc?: Color | null
    readonly str: string
    compareTo(p: IPixel): boolean
}

export class Pixel implements IPixel {
    constructor()
    constructor(char: IChar)
    constructor(char: IChar, bgc: Color | null)
    constructor(char: IChar, bgc: Color, fgc: Color)
    constructor(char: IChar, bgc?: Color | null, fgc?: Color | null)
    constructor(
        readonly char: IChar = new Char(),
        readonly bgc: Nullable<Color> = null,
        readonly fgc: Nullable<Color> = null
    ) {}

    get str() {
        return `${this.bgc?.bg ?? ''}${this.fgc?.fg ?? ''}${this.char}`
    }

    toString() {
        return this.str
    }

    compareTo(other: IPixel) {
        const bg = this.compareColor(this.bgc, other.bgc)
        const fg = this.compareColor(this.fgc, other.fgc)
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
