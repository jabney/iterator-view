/**
 * ESC[38;5;⟨n⟩m           Select foreground color where n is a number from the table below
 * ESC[48;5;⟨n⟩m           Select background color
 *     0- 7:               standard colors (as in ESC [ 30–37 m)
 *     8- 15:              high intensity colors (as in ESC [ 90–97 m)
 * 16-231:                 6 × 6 × 6 cube (216 colors): 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
 * 232-255:                grayscale from dark to light in 24 steps
 */

import { Scale } from './math'

const esc = '\x1b['
const reset = `\x1b[0m`

type Bits = 8 | 24

const fg = (_: TemplateStringsArray, bits: Bits, code: number) => {
    return `${esc}38;5;${code}m`
}

const bg = (_: TemplateStringsArray, bits: Bits, code: number) => {
    return `\x1b[48;5;${code}m`
}

export interface IRgb {
    r: number
    g: number
    b: number
}

export type RgbList = [r: number, g: number, b: number]

export interface IColor {
    rgb(r: number, g: number, b: number): void
    gray(value: number): void
}

export class Color {
    private static scaler = Scale.domain([0, 255]).range([0, 5], Math.round)

    static rgb(r: number, g: number, b: number, bits: Bits): Color {
        r = Math.max(0, r) & 0xff
        g = Math.max(0, g) & 0xff
        b = Math.max(0, b) & 0xff

        switch (bits) {
            case 24:
                return new Color(bits, r, g, b)
            case 8: {
                const scale = this.scaler
                return new Color(bits, scale(r), scale(g), scale(b))
            }
        }
    }

    constructor(
        readonly bits: Bits,
        readonly r: number,
        readonly g: number,
        readonly b: number
    ) {}

    private toByte(value: number) {}
}
