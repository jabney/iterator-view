import { Pixel } from '../pixel'
import { Char } from '../char'
import { Color } from '../color'
import { Nullable } from '../nullable'

export function strToPix(str: string, bg?: Nullable<Color>, fg?: Nullable<Color>): Pixel[] {
    const pixels: Pixel[] = []
    for (const c of str) {
        pixels.push(new Pixel(new Char(c), bg, fg))
    }
    return pixels
}
