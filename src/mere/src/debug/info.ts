import { count } from '../iteration'
import { Surface } from '../surface'
import { strToPix } from './helper'
import { rgbFn } from './rgb-fn'

/**
 *
 */
export const debugInfo = (surface: Surface, width: number, height: number) => {
    const bgc = rgbFn(0, 50, 50)
    const fgc = rgbFn(220, 220, 220)
    const fpsValues: number[] = [...count(50)]

    let lastMs = 0
    let fps = 0
    return (ms: number) => {
        const delta = ms - lastMs
        lastMs = ms

        fpsValues.push(1000 / delta)
        fpsValues.shift()
        fps = fpsValues.reduce((t, x) => t + x, 0) / fpsValues.length

        const fpsText = fps.toFixed(1) + ' fps '
        const fpsBox = fpsText.padStart(12, ' ')
        const info = strToPix(fpsBox, bgc, fgc)
        surface.write(info, 2, 1)
    }
}
