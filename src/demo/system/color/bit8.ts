import { Char } from '../char'

/**
 * ESC[38;5;⟨n⟩m           Select foreground color where n is a number from the table below
 * ESC[48;5;⟨n⟩m           Select background color
 *     0- 7:               standard colors (as in ESC [ 30–37 m)
 *     8- 15:              high intensity colors (as in ESC [ 90–97 m)
 * 16-231:                 6 × 6 × 6 cube (216 colors): 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
 * 232-255:                grayscale from dark to light in 24 steps
 */
const upper = 0xffffff00
const mask = 0xff

const fg = (_: TemplateStringsArray, code: number) => {
    return `\x1b[38;5;${code}m`
}

const bg = (_: TemplateStringsArray, code: number) => {
    return `\x1b[48;5;${code}m`
}
const reset = `\x1b[0m`

export class Bit8 {
    private _code: number = 0

    get code() {
        return this._code
    }

    rgb(r: number, g: number, b: number) {
        if (r >= 0 && r <= 5 && g >= 0 && g <= 5 && b >= 0 && b <= 5) {
            this._code = 16 + 36 * r + 6 * g + b
        }
        throw new RangeError(`components should be in the range 0-5: {r: ${r}, g: ${g}, b: ${b}}`)
    }

    gray(value: number) {
        if (value > 0 && value <= 24) {
            this._code = 231 + value
        }
        throw new RangeError(`value for gray should be in the range 1-24`)
    }

    printable(char: Char) {
        return `${this.fg}${char.str}`
    }

    get fg() {
        return fg`${this.code ?? 0}`
    }

    get bg() {
        return bg`${this.code}`
    }
}
