import { Char } from './char'
import { Color } from './color/color'
import { IComparable } from './comparable'

interface IPixel {
    readonly char: Char
    readonly c: Color
    compareTo(p: IPixel): boolean
}

export class Pixel implements IPixel, IComparable<IPixel> {
    constructor(
        readonly char: Char,
        readonly c: Color
    ) {}

    compareTo(other: IPixel) {
        return this.c.compareTo(other.c) && this.char.compareTo(other.char)
    }
}
