import { count } from '../../iterator'
import { Color } from '../../lib/color'
import { IRect } from '../types'

export type Frame = Color[][]

export class FrameBuffer {
    private frame: Frame = []

    constructor(readonly rect: IRect) {
        const line = ' '.repeat(rect.width)
        for (const _ of count(rect.height)) {
            this.frame.push(this.stringToPixels(line))
        }
    }

    private stringToPixels(line: string) {
        return [...line].map(x => new Color(x))
    }

    write(x: number, y: number, text: Color): void {
        if (x > this.rect.width || y > this.rect.height) {
            throw new Error(`<FrameBuffer.write> coordinates overflow for x=${x}, y=${y}`)
        }
        const str = text.raw

        if (str == null) {
            throw new Error(`<FrameBuffer.write> text object has null string`)
        }
        if (x + str.length > this.rect.width) {
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
        if (rect.x + rect.width > this.rect.width || rect.y + rect.height > this.rect.height) {
            throw new Error(``)
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
        for (const row of this.frame) {
            const line = row.map(x => x.str).join('')
            out.write(`${line}\n`)
        }
    }
}
