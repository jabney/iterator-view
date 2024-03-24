import { Rect } from '../rect'
import { Pixel } from '../pixel'
import { IRow, Row } from './row'

type Frame = IRow[]

export class Surface {
    private rect = new Rect()
    private frame: Frame = []

    constructor(
        private readonly width: number,
        private readonly height: number
    ) {}

    write(pixel: Pixel, x: number, y: number): void
    write(pixels: Pixel[], x: number, y: number): void
    write(pixels: Pixel | Pixel[], x: number, y: number): void {
        pixels = Array.isArray(pixels) ? pixels : [pixels]

        const rect = this.rect.expand(new Rect(x + pixels.length, y))
        this.rect = rect.clip(new Rect(this.width, this.height))

        for (let i = 0; i < pixels.length; i++) {
            this.writePixel(pixels[i], x + i, y)
        }
    }

    private writePixel(pixel: Pixel, x: number, y: number) {
        const row = this.frame[y] ?? new Row(y)
        row.set(x, pixel)
    }
}
