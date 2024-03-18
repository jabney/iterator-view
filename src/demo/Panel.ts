import { enumerate } from '../iterator'
import { Color } from '../lib/color'
import { sys } from './system'
import { IInsets, IPanel, IRect, Insets, Nullable } from './types'
import { insetRect, fill, fallbackBg } from './util'

abstract class BasePanel implements IPanel {
    private readonly id: number

    constructor(
        private _insets: IInsets,
        private _bg: Color | null = null
    ) {
        this.id = sys.nextId()
    }

    protected abstract get name(): string

    protected get bg(): Color | null {
        return this._bg
    }

    get insets(): IInsets {
        return this._insets
    }

    get debugName() {
        return `${this.name}: ${this.id}`
    }

    // abstract resize(bounds: IRect, bg: Color): void

    abstract render(bounds: IRect, bg?: Nullable<Color>): void

    abstract destroy(): void
}

export class Panel extends BasePanel {
    protected readonly children: IPanel[] = []

    constructor(insets: IInsets, bgColor?: Color) {
        super(insets, bgColor ?? new Color())
    }

    protected get name() {
        return Panel.name
    }

    add(child: IPanel) {
        this.children.push(child)
    }

    // resize(bounds: IRect, bg?: Nullable<Color>) {
    //     this.render(bounds, bg)
    //     for (const p of this.children) {
    //         p.render(insetRect(this.insets, bounds))
    //     }
    // }

    render(bounds: IRect, bg?: Nullable<Color>): void {
        const bgc = fallbackBg(this.bg, bg)
        const rect = insetRect(this.insets, bounds)
        fill(bgc, rect)

        for (const p of this.children) {
            p.render(rect, bgc)
        }
    }

    destroy() {
        for (const p of this.children) {
            p.destroy()
        }
        while (this.children.pop());
    }
}

export interface ITextElement extends IPanel {
    readonly text: Color
}

type hAlign = 'left' | 'center' | 'right'
type vAlign = 'top' | 'middle' | 'bottom'

export interface TextAlign {
    h: hAlign
    v: vAlign
}

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

// export class Marquee extends TextPanel {}

// export class CreditsPanel extends Panel {}
