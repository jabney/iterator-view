import { clamp } from '../lib/clamp'
import { IInsets, IRect } from './types'

export function insetRect(insets: IInsets, rect: IRect): IRect {
    const { top, left, bottom, right } = insets
    const width = rect.width - left - right
    const height = rect.height - top - bottom
    const pos = { x: rect.pos.x + left, y: rect.pos.y + top }
    return { width, height, pos }
}

export function clipRect(outer: IRect, inner: IRect): IRect {
    const [wMin, wMax] = [outer.pos.x, outer.pos.x + outer.width]
    const width = clamp(wMin, wMax, inner.pos.x + inner.width)
    const [hMin, hMax] = [outer.pos.y, outer.pos.y + outer.height]
    const height = clamp(hMin, hMax, inner.pos.y + inner.height)
    return { width, height, pos: { x: inner.pos.x, y: inner.pos.y } }
}

// type FillType = [x: number, y: number, c: Color]

// export function* fill(color: Color, rect: IRect): IterableIterator<FillType> {
//     for (const row of count(rect.height)) {
//         const x = rect.pos.x
//         const y = rect.pos.y + row
//         yield [x, y, color.text(' '.repeat(rect.width))]
//     }
// }
