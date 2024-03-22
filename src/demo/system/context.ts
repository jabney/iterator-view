import { Color } from '../../lib/color'
import { FrameBuffer } from './frame-buffer'
import { IRect, Nullable } from '../types'

export interface IContext extends Context {}

const pbuf = Symbol()

export class Context {
    private readonly [pbuf]: FrameBuffer = new FrameBuffer(0, 0)
    readonly rect: IRect
    readonly bg: Nullable<Color>
    readonly tc: Nullable<Color>

    constructor(ctx: Context, rect: IRect, bg?: Nullable<Color>, tc?: Nullable<Color>)
    constructor(buf: FrameBuffer, rect: IRect, bg: Nullable<Color>, tc?: Nullable<Color>)
    constructor(value: FrameBuffer | Context, rect: IRect, bg?: Nullable<Color>, tc?: Nullable<Color>) {
        if (value instanceof FrameBuffer) {
            this[pbuf] = value
            this.rect = rect
            this.bg = bg
            this.tc = tc
        } else {
            const ctx = value
            this[pbuf] = ctx[pbuf]
            this.rect = rect
            this.bg = bg ?? ctx.bg
            this.tc = tc ?? ctx.tc
        }
    }

    fill(color: Color, rect: IRect) {
        const buf = this[pbuf]
        buf.fill(color, rect)
    }

    write(x: number, y: number, text: Color): number {
        const buf = this[pbuf]

        if (buf.rect.width === 0 || buf.rect.height === 0) {
            throw new Error(`<Context.write> rect is empty`)
        }
        return buf.write(x, y, text)
    }
}
