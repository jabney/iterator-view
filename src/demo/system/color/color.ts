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

type Template = TemplateStringsArray

export interface ColorGenerator {
    fg(t: Template): string
    bg(t: Template): string
}

export interface IRgb {
    r: number
    g: number
    b: number
}

export type RgbList = [r: number, g: number, b: number]

const scale8 = Scale.domain([0, 255]).range([0, 5], Math.round)

/**
 * 16-231: 6 × 6 × 6 cube (216 colors):
 *         16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
 */
const rgbToByte = (r: number, g: number, b: number) => {
    return 16 + 36 * r + 6 * g + b
}

function bit8Gen(r: number, g: number, b: number): ColorGenerator {
    const code = rgbToByte(scale8(r), scale8(g), scale8(b))
    console.log(code)
    return {
        fg(t: Template) {
            const [text = ''] = t
            return `${esc}38;5;${code}m${text}`
        },
        bg(t: Template) {
            const [text = ''] = t
            return `${esc}48;5;${code}m${text}`
        },
    }
}

function bit24Gen(r: number, g: number, b: number): ColorGenerator {
    console.log([r, g, b])
    return {
        fg(t: Template) {
            const [text = ''] = t
            return `${esc}38;2;${r};${g};${b}m${text}`
        },
        bg(t: Template) {
            const [text = ''] = t
            return `${esc}48;2;${r};${g};${b}m${text}`
        },
    }
}

const sanitize = (r: number, g: number, b: number): IRgb => {
    return { r: Math.max(0, r) & 0xff, g: Math.max(0, g) & 0xff, b: Math.max(0, b) & 0xff }
}

export interface IColor {
    rgb(r: number, g: number, b: number): void
    gray(value: number): void
}

export class Color<T extends Bits> {
    static rgb<T extends Bits>(bits: T, r: number, g: number, b: number): Color<T> {
        const s = sanitize(r, g, b)

        if (bits === 8) {
            return new Color(bits, scale8(s.r), scale8(s.g), scale8(s.b))
        } else {
            return new Color(bits, s.r, s.g, s.b)
        }
    }

    constructor(
        readonly bits: T,
        readonly r: number,
        readonly g: number,
        readonly b: number
    ) {
        const s = sanitize(r, g, b)
        this.r = s.r
        this.g = s.g
        this.b = s.b
    }

    get str() {
        if (this.bits === 8) {
            return bit8Gen(this.r, this.g, this.b)
        } else {
            return bit24Gen(this.r, this.g, this.b)
        }
    }
}
