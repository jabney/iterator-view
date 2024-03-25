import { Surface } from '../system/surface/surface'
import { Pixel } from '../system/pixel'
import { Color } from '../system/color'

/**
 *
 */
export class PixelEntity {
    private readonly x: number
    private readonly y: number
    private readonly rand = Math.random()

    private readonly bgc = Color.bit24(255 * Math.random(), 255 * Math.random(), 255 * Math.random())
    private readonly pixels: Pixel[]

    private readonly amp = 10 + 10 * Math.random()
    private readonly time = 0.02 + 0.02 * Math.random()

    constructor(
        private readonly sfc: Surface,
        width: number,
        height: number
    ) {
        this.x = width / 2 - 1 + (this.rand < 0.5 ? -5 : 5)
        this.y = height / 2 + (this.rand < 0.5 ? -5 : 5)

        const p = Pixel.from(this.bgc)
        this.pixels = [p, p]
    }

    render(elapsed: number) {
        elapsed = elapsed / 10
        const x = this.x + 2 * this.amp * Math.cos(this.time * elapsed)
        const y = this.y + this.amp * Math.sin(this.time * elapsed)
        this.sfc.write(this.pixels, x, y)
        this.sfc.write(this.pixels, x, y)
    }
}
