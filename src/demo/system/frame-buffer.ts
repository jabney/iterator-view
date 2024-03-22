import { count } from '../../iterator'
import { Color } from '../../lib/color'
import { Rect } from './rect'
import { IRect, Range } from '../types'

function boundingRect(rects: IRect[]): IRect {
    if (rects.length == 0) return new Rect()

    const first = rects[0]
    let x1 = first.x
    let y1 = first.y
    let x2 = first.x + first.width
    let y2 = first.y + first.height

    for (let i = 1; i < rects.length; i++) {
        const r = rects[i]
        x1 = Math.min(x1, r.x)
        y1 = Math.min(y1, r.y)
        x2 = Math.max(x2, r.x + r.width)
        y2 = Math.max(y2, r.y + r.height)
    }

    return new Rect(x2 - x1, y2 - y1, x1, y1)
}

function clipRect(r: IRect, v: IRect) {
    const x1 = Math.max(r.x, v.x)
    const x2 = Math.min(r.x + r.width, v.x + v.width)
    const y1 = Math.max(r.y, v.y)
    const y2 = Math.min(r.y + r.height, v.y + v.height)
    if (x1 < x2 && y1 < y2) return new Rect(x2 - x1, y2 - y1, x1, y1)
    return new Rect()
}

function hitTestRects(rects: IRect[], x: number, y: number): boolean {
    return rects.some(rect => {
        return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height
    })
}

function clipLine(rect: IRect, x1: number, x2: number): Range<number> {
    return [Math.max(x1, rect.x), Math.min(x2, rect.x + rect.width)]
}

// const r1 = new Rect(10, 10, 0, 0)
// const r2 = new Rect(10, 10, 10, 10)
// const b = boundingRect([r1, r2])

// for (let row = b.y; row < b.y + b.height; row++) {
//     for (let col = b.x; col < b.x + b.width; col++) {
//         process.stdout.write(hitTestRects([r1, r2], col, row) ? 'x ' : '- ')
//     }
//     process.stdout.write('\n')
// }

export type Frame = Color[][]

const sanitize = /[\n\r]+/g

export class FrameBuffer {
    readonly rect: Rect
    private frame: Frame = []
    private out = process.stdout

    constructor(width: number, height: number) {
        this.rect = new Rect(width, height)

        if (!this.rect.empty()) {
            const line = ' '.repeat(this.rect.width)
            for (const _ of count(this.rect.height)) {
                this.frame.push(this.stringToPixels(line))
            }
        }
    }

    private stringToPixels(line: string) {
        return [...line].map(x => new Color(x))
    }

    private isEmpty(rect: IRect) {
        return rect.width === 0 || rect.height === 0
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
        if (this.isEmpty(rect)) {
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
        for (const row of this.frame) {
            const line = row.map(p => p.str).join('')
            this.out.write(line + '\n')
        }
    }
}
