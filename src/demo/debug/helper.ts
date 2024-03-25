import { Pixel } from '../system/pixel'
import { Char } from '../system/char'
import { Color as SColor } from '../system/color'
import { Nullable } from '../types'

export function strToPix(str: string, bg?: Nullable<SColor>, fg?: Nullable<SColor>): Pixel[] {
    const pixels: Pixel[] = []
    for (const c of str) {
        pixels.push(new Pixel(new Char(c), bg, fg))
    }
    return pixels
}
