import { Pixel } from '../system/pixel'
import { Char } from '../system/char'
import { Color } from '../system/color'
import { Nullable } from '../types'

export function strToPix(str: string, bg?: Nullable<Color>, fg?: Nullable<Color>): Pixel[] {
    const pixels: Pixel[] = []
    for (const c of str) {
        pixels.push(new Pixel(new Char(c), bg, fg))
    }
    return pixels
}
