import { Color } from '../../lib/color'
import { FrameBuffer } from './frame-buffer'
import { IRect, Nullable } from '../types'
import { Rect } from './rect'

export interface IContext extends Context {}

export class Context {
    private readonly buf: FrameBuffer = new FrameBuffer(new Rect())
    readonly rect: IRect
    readonly bg: Nullable<Color>

    constructor(ctx: Context, rect: IRect, bg?: Nullable<Color>)
    constructor(buf: FrameBuffer, rect: IRect, bg: Nullable<Color>)
    constructor(value: FrameBuffer | Context, rect: IRect, bg?: Nullable<Color>) {
        if (value instanceof FrameBuffer) {
            this.buf = value
            this.rect = rect
            this.bg = bg
        } else {
            const ctx = value
            this.buf = ctx.buf
            this.rect = rect
            this.bg = bg ?? ctx.bg
        }
    }

    fill(color: Color, rect: IRect) {
        this.buf.fill(color, rect)
    }

    write(x: number, y: number, text: Color): void {
        if (this.buf.rect.width === 0 || this.buf.rect.height === 0) {
            throw new Error(`<Context.write> rect is empty`)
        }
        this.buf.write(x, y, text)
    }
}
