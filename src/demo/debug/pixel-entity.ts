import { Surface } from '../system/surface/surface'
import { Pixel } from '../system/pixel'
import { Scale } from '../system/color/math'
import { IColor, RgbFn } from '../system/color/color'

/**
 *
 */
export class PixelEntity {
    readonly x: number
    readonly y: number

    private readonly rand1 = Math.random()
    private readonly rand2 = Math.random()
    private readonly rand3 = Math.random()

    private readonly bgc: IColor
    private readonly pixels: Pixel[]

    private readonly amp = 10 + 10 * this.rand2
    private readonly time = 2 + 1 * this.rand3

    private readonly offs: { x: number; y: number }

    constructor(
        private readonly sfc: Surface,
        width: number,
        height: number,
        rgbFn: RgbFn
    ) {
        this.bgc = rgbFn(255 * this.rand1, 255 * this.rand2, 255 * this.rand3)
        this.offs = this.randOffset(this.rand1, this.rand2)

        this.x = width / 2 + this.offs.x
        this.y = height / 2 + this.offs.y
        const p = Pixel.from(this.bgc)
        this.pixels = [p, p]
    }

    render(elapsed: number) {
        elapsed = 0.001 * elapsed
        const time = this.time * elapsed
        const scale = 0.01
        const x = this.x + 2 * this.amp * Math.cos(time + scale * this.offs.x)
        const y = this.y + this.amp * Math.sin(time + scale * this.offs.y)
        this.sfc.write(this.pixels, x, y)
        this.sfc.write(this.pixels, x, y)
    }

    private scalePosX = Scale.interpolate([-10, 10])
    private scalePosY = Scale.interpolate([-10, 10])

    private randOffset(tx: number, ty: number) {
        return { x: this.scalePosX(tx), y: this.scalePosY(ty) }
    }
}
