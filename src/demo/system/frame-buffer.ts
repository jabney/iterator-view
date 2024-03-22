import { count } from '../../iterator'
import { Color } from '../../lib/color'
import { Rect } from './rect'
import { IRect } from '../types'

export type Frame = Color[][]

const sanitize = /[\n\r]+/g

function stringToPixels(line: string) {
    return [...line].map(x => new Color(x))
}

class Surface {
    private rect = new Rect()
    private frame: Frame = []

    constructor(
        private readonly maxWidth: number,
        private readonly maxHeight: number
    ) {}

    write(pixel: Color, x: number, y: number): void
    write(pixels: Color[], x: number, y: number): void
    write(pixels: Color | Color[], x: number, y: number): void {
        pixels = Array.isArray(pixels) ? pixels : [pixels]
        const r = this.rect.expand(new Rect(x + pixels.length, y))
        this.rect = this.rect.clip(r)
    }
}

export class FrameBuffer {
    readonly rect: Rect
    private frame: Frame = []
    private out = process.stdout

    constructor(width: number, height: number) {
        this.rect = new Rect(width, height)

        if (this.rect.hasArea) {
            const line = ' '.repeat(this.rect.width)
            for (const _ of count(this.rect.height)) {
                this.frame.push(stringToPixels(line))
            }
        }
    }

    write(x: number, y: number, text: Color): number {
        if (x > this.rect.width || y > this.rect.height) {
            throw new Error(`<FrameBuffer.write> coordinates overflow for x=${x}, y=${y}`)
        }

        if (text.raw == null) {
            throw new Error(`<FrameBuffer.write> null text`)
        }
        const str = text.raw.replace(sanitize, '')

        if (x + text.raw.length > this.rect.width) {
            throw new Error(`<FrameBuffer.write> text overflows buffer line`)
        }

        const row = this.frame[y]
        const [start, end] = [x, x + str.length]

        if (text.hasBg) {
            const bg = text.bg
            for (let i = start; i < end; i++) {
                row[i] = bg.text(str[i - x])
            }
        } else {
            for (let i = start; i < end; i++) {
                const bg = row[i].bg
                const tc = text.bgFrom(bg)
                const pixel = tc.text(str[i - x])
                row[i] = pixel
            }
        }
        return x + str.length
    }

    fill(color: Color, rect: IRect): void {
        if (!Rect.hasArea(rect)) {
            throw new Error(`<FrameBuffer.fill> rect is empty`)
        }
        const bg = color.bg

        for (const row of count(rect.height)) {
            for (const col of count(rect.width)) {
                const x = rect.x + col
                const y = rect.y + row
                this.frame[y][x] = bg.text(' ')
            }
        }
    }

    present(): void {
        this.out.cursorTo(0, 0)
        for (const row of this.frame) {
            const line = row.map(p => p.str).join('')
            this.out.write(line + '\n')
        }
    }
}
