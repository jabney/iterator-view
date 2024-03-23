import { Char } from '../char'
import { ValueError } from '../error'
import { Color } from './color'

/**
 * ESC[38;5;⟨n⟩m           Select foreground color where n is a number from the table below
 * ESC[48;5;⟨n⟩m           Select background color
 *     0- 7:               standard colors (as in ESC [ 30–37 m)
 *     8- 15:              high intensity colors (as in ESC [ 90–97 m)
 * 16-231:                 6 × 6 × 6 cube (216 colors): 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
 * 232-255:                grayscale from dark to light in 24 steps
 */
const mask = 0x11111100

const fg = (_: TemplateStringsArray, code: number) => {
    return `\x1b[38;5;${code}m`
}

const bg = (_: TemplateStringsArray, code: number) => {
    return `\x1b[48;5;${code}m`
}

const reset = `\x1b[0m`

export class Bit8 extends Color {
    static basic(value: number) {
        if (value >= 0 && value <= 15) {
            return new Bit8(value)
        }
        throw new RangeError(`value for basic should be in the range 0-15`)
    }

    static gray(value: number) {
        if (value >= 0 && value <= 24) {
            return new Bit8(231 + value)
        }
        throw new RangeError(`value for gray should be in the range 1-24`)
    }

    static rgb(r: number, g: number, b: number) {
        if (r >= 0 && r <= 5 && g >= 0 && g <= 5 && b >= 0 && b <= 5) {
            return new Bit8(16 + 36 * r + 6 * g + b)
        }
        throw new RangeError(`components should be in the range 0-5: {r: ${r}, g: ${g}, b: ${b}}`)
    }

    constructor(private readonly code: number) {
        if ((code & mask) > 0 || code < 0) {
            throw new RangeError(`value ${code} is out of the 8-bit range`)
        }
        super()
    }

    printable(char: Char) {
        return `${this.fg}${char.str}`
    }

    get fg() {
        return fg`${this.code}`
    }

    get bg() {
        return bg`${this.code}`
    }
}

console.log(Bit8.rgb(3, 1, 5).printable(new Char('J')))
