import { Surface } from '../surface'
import { PixelEntity } from './entity'
import { strToPix } from './helper'
import { Timer } from '../timer'
import { hideCursor } from './cursor'
import { rgbFn } from './rgb-fn'
import { debugInfo } from './info'
import { count } from '../iteration'
import { Host } from '../host'
import { Disposer } from '../disposer'
import { Scale } from '../math'
import { IRgb } from '../color'
import { rgbToRgb } from '../rgb'

const timer = Timer(120)

export async function SurfaceTest() {
    const width = 2 * 60
    const height = 40
    const surface = new Surface(width, height, rgbFn(0, 152, 64))

    /**
     *
     */
    const animText = (surface: Surface, width: number, height: number) => {
        const text = `Jimmy`
        const fg = rgbFn(220, 220, 220)
        const bg = rgbFn(50, 0, 50)
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
        const fill = rgbFn(160, 0, 220)
        const drawDebug = debugInfo(surface, width, height)
        const drawAnim = animText(surface, width, height)

        hideCursor()
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

const spawner = (width: number, height: number, surface: Surface) => {
    return (size: number) => {
        return [...count(size)].map(() => new PixelEntity(surface, width, height, rgbFn))
    }
}

export async function SurfaceAnim() {
    const width = 2 * 60
    const height = 40

    const bgc = rgbFn(0, 100, 50)
    const surface = new Surface(width, height, bgc)

    const host = Host.create(width, height, surface)

    const entities: PixelEntity[] = []

    const drawDebug = debugInfo(surface, width, height)
    const spawn = spawner(width, height, surface)
    const disposer = new Disposer()

    surface.fill()

    let count = 0
    const interval = setInterval(() => {
        entities.push(...spawn(10))
        if (++count == 50) clearInterval(interval)
    }, 100)
    disposer.add(() => void clearInterval(interval))

    disposer.add(
        timer.addListener(elapsed => {
            surface.clearFrame()
            drawDebug(elapsed)

            entities.forEach(x => x.render(elapsed))
            surface.renderFrame()
        })
    )

    host.addEventListener('exit', () => {
        disposer.destroy()
    })
}

export function Burst() {
    const width = 2 * 60
    const height = 40

    const bgc = rgbFn(0, 100, 50)
    const surface = new Surface(width, height, bgc)
    const c1: IRgb = { r: 200, g: 100, b: 50 }
    const c2: IRgb = { r: 200, g: 50, b: 0 }

    const cInterpolate = rgbToRgb(c1, c2)
    cInterpolate(0.5)
}
