import { IRgb } from './color'
import { Scale } from './math'
import { clamp } from './util'

const rgb6 = clamp.bind(null, 0, 5)

/**
 * Valid for (0 ≤ r, g, b ≤ 5)
 *
 * Ex. bg8`${rgbToCode(4, 1, 4)}`
 */
export function rgb6ToCode8(r: number, g: number, b: number) {
    ;[r, g, b] = [rgb6(r), rgb6(g), rgb6(b)]
    return 16 + 36 * r + 6 * g + b
}

export const rgbToRgb = (c1: IRgb, c2: IRgb) => {
    const r = Scale.interpolate([c1.r, c2.r])
    const g = Scale.interpolate([c1.g, c2.g])
    const b = Scale.interpolate([c1.b, c2.b])

    return (t: number) => {
        return { r: r(t), g: g(t), b: b(t) }
    }
}
