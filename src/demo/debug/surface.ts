import { sys } from '../system/system'
import { Surface } from '../system/surface/surface'
import { Color as SColor } from '../system/color'
import { PixelEntity } from './pixel-entity'
import { strToPix } from './helper'
import { TimerManager } from '../system/timer-manager'
import { count } from '../system/iteration'

const timer = TimerManager(120)

/**
 *
 */
const debugInfo = (surface: Surface, width: number, height: number) => {
    const debugFill = SColor.bit24(32, 0, 64)
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
        const info = strToPix(fpsBox, debugFill)
        surface.write(info, 2, 1)
    }
}

export async function SurfaceTest() {
    const width = 2 * 60
    const height = 40
    const surface = new Surface(width, height, SColor.bit24(0, 152, 64))

    /**
     *
     */
    const animText = (surface: Surface, width: number, height: number) => {
        const text = `Jimmy`
        const fg = SColor.bit24(220, 220, 220)
        const bg = SColor.bit24(50, 0, 50)
        const pixels = strToPix(` Jimmy `, bg, fg)

        const [amp, time] = [15, 0.005]

        const pos = {
            x: width / 2 - text.length / 2,
            y: height / 2,
        }

        return (elapsed: number) => {
            const x = pos.x + Math.round(0.5 * amp * Math.cos(3 * time * elapsed))
            const y = pos.y + Math.round(amp * Math.sin(time * elapsed))
            surface.write(pixels, x, y)
        }
    }
    /**
     *
     */
    function run() {
        const fill = SColor.bit24(160, 0, 220)
        const drawDebug = debugInfo(surface, width, height)
        const drawAnim = animText(surface, width, height)

        sys.hideCursor()
        console.clear()
        surface.fill()

        timer.addListener(elapsed => {
            surface.clear()

            drawDebug(elapsed)
            drawAnim(elapsed)

            surface.render(fill)
        })
    }
    run()
}

export async function SurfaceAnim() {
    /**
     *
     */
    const width = 2 * 60
    const height = 40
    const bgc = SColor.bit24(0, 100, 50)
    const surface = new Surface(width, height, bgc)
    const entities: PixelEntity[] = []

    const drawDebug = debugInfo(surface, width, height)

    console.clear()
    sys.hideCursor()
    surface.fill()

    for (let i = 0; i < 50; i++) {
        const entity = new PixelEntity(surface, width, height)
        entities.push(entity)
    }

    timer.addListener(elapsed => {
        surface.clearFrame()
        drawDebug(elapsed)

        entities.forEach(x => x.render(elapsed))
        surface.renderFrame()
    })
}
