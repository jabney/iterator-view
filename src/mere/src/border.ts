import { Color, IColor } from './color'
import { IFrame } from './frame'
import { IInsets } from './insets'
import { count } from './iteration'
import { IRect } from './rect'

const lt = {
    h: '\u2500', //   ─ horz
    tl: '\u250c', //  ┌ top-left
    tr: '\u2510', //  ┐ top-right
    v: '\u2502', //   │ vert
    bl: '\u2514', //  └
    br: '\u2518', //  ┘
}

export type BorderStyle = 'light'

export interface IBorder extends IFrame {
    // readonly frame: IFrame
}

export class Border implements IBorder {
    private readonly out = process.stdout

    constructor(
        readonly rect: IRect,
        readonly insets: IInsets,
        readonly bgc: IColor = Color.bit24(32, 0, 64),
        readonly fgc: IColor = Color.bit24(200, 200, 200)
        // readonly frame: IFrame
    ) {}

    draw() {
        const { width: w, height: h } = this.rect

        const horz = lt.h.repeat(w - 2)
        const top = lt.tl + horz + lt.tr
        const row = lt.v + ' '.repeat(w - 2) + lt.v
        const bottom = lt.bl + horz + lt.br

        this.out.cursorTo(0, 0)
        this.out.write(top)
        for (const y of count(h - 2)) {
            this.out.cursorTo(0, y + 1)
            this.out.write(row)
        }
        this.out.cursorTo(0, h - 1)
        this.out.write(bottom)
    }
}
