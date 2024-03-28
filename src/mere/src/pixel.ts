import { Nullable } from './nullable'
import { Char, IChar } from './char'
import { IColor } from './color'
import { IComparable } from './comparable'
import { IStringable } from './stringable'

export interface IPixel extends IComparable<IPixel>, IStringable {
    readonly char: IChar
    readonly bgc?: IColor | null
    readonly fgc?: IColor | null
    readonly str: string
    compareTo(p: IPixel): boolean
}

export class Pixel implements IPixel {
    static from(bg: IColor) {
        return new Pixel(new Char(), bg)
    }

    static fromChar(str: string, fg?: IColor | null, bg?: IColor | null) {
        const char = new Char(str)
        return new Pixel(char, bg, fg)
    }

    constructor()
    constructor(char: IChar)
    constructor(char: IChar, bgc: IColor | null)
    constructor(char: IChar, bgc: IColor, fgc: IColor)
    constructor(char: IChar, bgc?: IColor | null, fgc?: IColor | null)
    constructor(
        readonly char: IChar = new Char(),
        readonly bgc: Nullable<IColor> = null,
        readonly fgc: Nullable<IColor> = null
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

    private compareColor(a: Nullable<IColor>, b: Nullable<IColor>): boolean {
        if (a != null) {
            return b == null ? false : a.compareTo(b)
        }
        if (b != null) {
            return a == null ? false : b.compareTo(a)
        }
        return true
    }
}
