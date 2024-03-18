import { enumerate } from '../../iterator'
import { Color } from '../../lib/color'
import { sys } from '../system/system'
import { IRect, Nullable, TextAlign } from '../types'
import { fallbackBg, fill, insetRect } from '../util'
import { Insets } from './insets'
import { BasePanel } from './panel'

export class TextPanel extends BasePanel {
    protected readonly text: Color[]

    constructor(
        text: Color | Color[],
        insets = new Insets(),
        bg?: Nullable<Color>,
        private readonly align: Nullable<TextAlign> = { h: 'center', v: 'middle' }
    ) {
        super(insets, bg?.bg)
        this.text = Array.isArray(text) ? text : [text]
    }

    protected get name() {
        return TextPanel.name
    }

    render(bounds: IRect, bg?: Nullable<Color>) {
        const rect = insetRect(this.insets, bounds)
        const bgc = fallbackBg(this.bg, bg)
        fill(bgc, rect)

        const top = this.vAlign(this.text.length, rect)
        for (const [row, text] of enumerate(this.text)) {
            sys.cursorTo(rect.x, row + top)
            const padded = this.hAlign(text, rect.width)
            sys.write(padded.bgFrom(bgc).str)
        }
    }

    private hAlign(c: Color, width: number) {
        const str = c.raw
        if (str != null && str.length > 0) {
            const align = this.align?.h ?? 'center'
            switch (align) {
                case 'left': {
                    return c
                }
                case 'center': {
                    const pad = width - str.length
                    const left = Math.floor(pad / 2)
                    return c.text(`${this.pad(left)}${str}`)
                }
                case 'right': {
                    const len = str.length
                    const pad = width - len
                    return c.text(`${this.pad(pad)}${str}`)
                }
            }
        }
        return Color.text('')
    }

    private vAlign(num: number, rect: IRect) {
        const align = this.align?.v ?? 'top'
        switch (align) {
            case 'top':
                return rect.y
            case 'middle':
                return Math.floor((rect.height - num) / 2) + 1
            case 'bottom':
                return rect.y + rect.height - num
        }
    }

    private pad(len: number) {
        return ' '.repeat(len)
    }

    destroy() {}
}
