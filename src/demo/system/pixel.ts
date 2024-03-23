import { Char } from './char'
import { Color } from './color/color'

export class Pixel {
    constructor(
        private readonly char: Char,
        private readonly c: Color
    ) {
        //
    }
}
