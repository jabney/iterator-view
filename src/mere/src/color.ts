/**
 * ESC[38;5;⟨n⟩m           Select foreground color where n is a number from the table below
 * ESC[48;5;⟨n⟩m           Select background color
 *     0- 7:               standard colors (as in ESC [ 30–37 m)
 *     8- 15:              high intensity colors (as in ESC [ 90–97 m)
 * 16-231:                 6 × 6 × 6 cube (216 colors): 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
 * 232-255:                grayscale from dark to light in 24 steps
 */

import { IComparable } from './comparable'
import { Scale } from './math'

type Bits = 8 | 24

export interface IRgb {
    readonly r: number
    readonly g: number
    readonly b: number
}

export interface IColor extends IComparable<IColor> {
    readonly bits: Bits
    readonly rgb: IRgb
    readonly r: number
    readonly g: number
    readonly b: number
    readonly fg: string
    readonly bg: string
}

type RgbComps = [number, number, number]

const esc = '\x1b['

const sanitize = (r: number, g: number, b: number): IRgb => {
    return { r: Math.max(0, r) & 0xff, g: Math.max(0, g) & 0xff, b: Math.max(0, b) & 0xff }
}

export type RgbFn = (r: number, g: number, b: number) => IColor

export abstract class Color implements IColor {
    static create(bits: Bits, r: number, g: number, b: number) {
        return bits === 8 ? this.bit8(r, g, b) : this.bit24(r, g, b)
    }

    static bit8(r: number, g: number, b: number) {
        return new Color8(r, g, b)
    }

    static bit24(r: number, g: number, b: number) {
        return new Color24(r, g, b)
    }

    abstract readonly bits: Bits
    abstract readonly fg: string
    abstract readonly bg: string

    private readonly _rgb: IRgb

    constructor(r: number, g: number, b: number) {
        this._rgb = Object.freeze(sanitize(r, g, b))
    }

    get rgb(): IRgb {
        return this._rgb
    }

    get r() {
        return this.rgb.r
    }

    get g() {
        return this.rgb.g
    }

    get b() {
        return this.rgb.b
    }

    compareTo(other: IColor): boolean {
        return (
            this.bits === other.bits &&
            //
            this.r === other.r &&
            this.g === other.g &&
            this.b === other.b
        )
    }
}

function scaleBytes(r: number, g: number, b: number, raw = false): RgbComps {
    const scale = Scale.domain([0, 255]).range([0, 5], Math.round)
    return raw ? [r, g, b] : [scale(r), scale(g), scale(b)]
}

function rgbToCode(rgb: IRgb, raw = false): number {
    const [r, g, b] = scaleBytes(rgb.r, rgb.g, rgb.b, raw)
    return 16 + 36 * r + 6 * g + b
}

class Color8 extends Color {
    private readonly code: number

    constructor(
        r: number,
        g: number,
        b: number,
        private readonly raw = false
    ) {
        super(r, g, b)

        this.code = this.rgbToCode()
    }

    get bits(): Bits {
        return 8
    }

    get fg() {
        const code = this.rgbToCode()
        return `${esc}38;5;${code}m`
    }

    get bg() {
        const code = this.rgbToCode()
        return `${esc}48;5;${code}m`
    }

    private rgbToCode(): number {
        const code = rgbToCode(this.rgb, this.raw)
        return code
    }
}

class Color24 extends Color {
    constructor(r: number, g: number, b: number) {
        super(r, g, b)
    }

    get bits(): Bits {
        return 24
    }

    get fg() {
        const { r, g, b } = this.rgb
        return `${esc}38;2;${r};${g};${b}m`
    }

    get bg() {
        const { r, g, b } = this.rgb
        return `${esc}48;2;${r};${g};${b}m`
    }
}
