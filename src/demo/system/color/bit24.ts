/**
 * ESC[38;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB foreground color
 * ESC[48;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB background color
 */
export interface IRgb {
    r: number
    g: number
    b: number
}

export type RgbList = [r: number, g: number, b: number]

const esc = '\x1b['
const fg = `${esc}38;2;`
const bg = `${esc}48;2;`
const reset = `\x1b[0m`

export class Bit24 {
    constructor(
        readonly r: number,
        readonly g: number,
        readonly b: number
    ) {
        r = r & 0xff
        g = g & 0xff
        b = b & 0xff
    }

    toList(): RgbList {
        return [this.r, this.g, this.b]
    }

    toString() {}

    private get printable() {
        return `${esc}`
    }
}
