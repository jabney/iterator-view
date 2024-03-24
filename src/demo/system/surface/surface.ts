import { Rect } from '../rect'
import { IPixel, Pixel } from '../pixel'
import { IRow, Row } from './row'
import { Color } from '../color'
import { Char } from '../char'

type Frame = IRow[]

function* count(num: number) {
    num = Math.trunc(num)

    for (let i = 0; i < num; i++) {
        yield i
    }
}

export class Surface {
    private rect = new Rect()
    private frame: Frame = []

    constructor(
        private readonly width: number,
        private readonly height: number
    ) {}

    write(pixel: IPixel, x: number, y: number): void
    write(pixels: IPixel[], x: number, y: number): void
    write(pixels: IPixel | IPixel[], x: number, y: number): void {
        pixels = Array.isArray(pixels) ? pixels : [pixels]

        const rect = this.rect.expand(new Rect(x + pixels.length, y))
        this.rect = rect.clip(new Rect(this.width, this.height))

        for (let i = 0; i < pixels.length; i++) {
            this.writePixel(pixels[i], x + i, y)
        }
    }

    render(fill: Color) {
        const out = process.stdout
        out.cursorTo(0, 0)
        for (const y of count(this.height)) {
            const row = this.frame[y] ?? new Row(y)
            for (const col of count(this.width)) {
                const p = row.get(col) ?? new Pixel(new Char(), fill)
                out.write(p.str)
            }
            out.write('\x1b[0m\n')
        }
    }

    clear() {
        this.frame = []
    }

    private writePixel(pixel: IPixel, x: number, y: number) {
        const row = this.frame[y] ?? new Row(y)
        row.set(x, pixel)
        this.frame[y] = row
    }
}
