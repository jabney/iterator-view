import { count } from '../../iterator'
import { Color } from '../../lib/color'
import { Rect } from './rect'
import { IRect } from '../types'

export type Frame = Color[][]
const sanitize = /[\n\r]+/g

export class FrameBuffer {
    readonly rect: Rect
    private frame: Frame = []

    constructor(rect: IRect) {
        this.rect = new Rect(rect.width, rect.height)

        if (!this.rect.empty()) {
            const line = ' '.repeat(rect.width)
            for (const _ of count(rect.height)) {
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

    write(x: number, y: number, text: Color): void {
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
    }

    fill(color: Color, rect: IRect): void {
        if (this.isEmpty(rect)) {
            throw new Error(`<FrameBuffer.fill> rect is empty`)
        }
        const bg = color.bg

        for (const row of count(rect.height)) {
            for (const col of count(rect.width)) {
                this.frame[rect.y + row][rect.x + col] = bg.text(' ')
            }
        }
    }

    present(): void {
        const out = process.stdout
        const rows = this.frame.map(row => row.map(p => p.str).join(''))
        out.write(rows.join('\n'))
    }
}
