import { count } from '../iterator'
import { clamp } from '../lib/clamp'
import { Color } from '../lib/color'
import { sys } from './system'
import { IInsets, IRect, Nil, Nullable, Rect } from './types'

export function insetRect(insets: IInsets, rect?: Nullable<IRect>): IRect {
    const r = rect ?? new Rect()
    const { top, left, bottom, right } = insets

    const width = r.width - left - right
    const height = r.height - top - bottom

    const x = r.x + left
    const y = r.y + top

    return { width, height, x, y }
}

export function clipRect(outer: IRect, inner: IRect): IRect {
    const [wMin, wMax] = [outer.x, outer.x + outer.width]
    const width = clamp(wMin, wMax, inner.x + inner.width)

    const [hMin, hMax] = [outer.y, outer.y + outer.height]
    const height = clamp(hMin, hMax, inner.y + inner.height)

    return { width, height, x: inner.x, y: inner.y }
}

export function* rowIterator(rect: IRect) {
    const x = rect.x
    const y = rect.y

    for (const row of count(rect.height)) {
        yield { x: x, y: y + row }
    }
}

export function fill(color: Color, rect: IRect) {
    for (const row of count(rect.height)) {
        const x = rect.x
        const y = rect.y + row
        const text = color.asText(' '.repeat(rect.width))
        sys.cursorTo(x, y)
        sys.write(text)
    }
}

export function fallbackBg(...args: (Color | Nil)[]): Color {
    for (const c of args.filter((x): x is Color => x != null)) {
        if (c.hasBg) return c.bg
    }
    return new Color()
}
