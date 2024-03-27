import { IRect, Rect } from './rect'
import { IPixel, Pixel } from './pixel'
import { IRow, Row } from './row'
import { IColor } from './color'
import { Char } from './char'
import { count } from './iteration'

type Frame = IRow[]

const out = process.stdout

const rowEnd = '\x1b[0m\n'

export class Surface {
    private rect: Rect = new Rect()
    private frame: Frame = []

    constructor(
        private readonly width: number,
        private readonly height: number,
        private readonly bgc: IColor
    ) {}

    write(pixel: IPixel, x: number, y: number): void
    write(pixels: readonly IPixel[], x: number, y: number): void
    write(pixels: IPixel | readonly IPixel[], x: number, y: number): void {
        pixels = Array.isArray(pixels) ? pixels : [pixels]
        x = Math.round(x)
        y = Math.round(y)

        const rect = this.rect.expand(new Rect(x + pixels.length, y))
        this.rect = rect.clip(new Rect(this.width, this.height))

        for (const i of count(pixels.length)) {
            this.writePixel(pixels[i], x + i, y)
        }
    }

    fill(color: IColor = this.bgc) {
        for (const y of count(this.height)) {
            const row = Row.fill(y, this.width, Pixel.from(color))
            out.write(row.render())
            out.write(rowEnd)
        }
    }

    clearFrame() {
        for (const y of count(this.height)) {
            const row = this.frame[y]
            if (row == null) continue

            for (const x of count(this.width)) {
                const p = row.get(x)
                if (p == null) continue

                out.cursorTo(x, y)
                out.write(Pixel.from(this.bgc).str)
            }
            out.write(rowEnd)
        }
        this.frame = []
    }

    renderFrame() {
        for (const y of count(this.height)) {
            const row = this.frame[y]
            if (row == null) continue

            for (const x of count(this.width)) {
                const p = row.get(x)
                if (p != null) {
                    out.cursorTo(x, y)
                    out.write(p.str)
                }
            }
            out.write(rowEnd)
        }
    }

    render(fill: IColor) {
        out.cursorTo(0, 0)

        for (const y of count(this.height)) {
            out.write(fill.bg) // pixels at the start with no bg will get default fill

            const row = this.frame[y] ?? new Row(y)
            for (const col of count(this.width)) {
                const p = row.get(col) ?? new Pixel(new Char(), fill)
                out.write(p.str)
            }
            out.write(rowEnd)
        }
    }

    clear() {
        this.frame = []
    }

    private writePixel(pixel: IPixel, x: number, y: number) {
        if (inBounds(this.rect, x, y)) {
            const row = this.frame[y] ?? new Row(y)

            row.set(x, pixel)
            this.frame[y] = row
        }
    }
}

function inBounds(rect: IRect, x: number, y: number) {
    return x >= 0 && x < rect.width && y >= 0 && y < rect.height
}

function clipPixels(pixels: readonly IPixel[], width: number, x: number) {
    const len = x + pixels.length

    if (len > width) {
        const diff = len - width
        return pixels.slice(0, -diff)
    }
    return pixels
}
