import { count } from '../iterator'
import { Color } from '../lib/color'
import { sys } from './system'
import { IInsets, IRect, Insets, Nil, Nullable, Rect } from './types'
import { insetRect, clipRect, fill, fallbackBg } from './util'

interface IPanel {
    readonly rect: IRect
    readonly insets: IInsets
    render(bounds: IRect, bg: Nullable<Color>): void
}

const id = (() => {
    const counter = count(Infinity)

    return {
        get next(): number {
            return counter.next().value
        },
    }
})()

abstract class BasePanel implements IPanel {
    private readonly id: number

    constructor(
        private _rect: IRect,
        private _insets: IInsets,
        private _bg: Color | Nil = null
    ) {
        this.id = id.next
    }

    protected abstract get name(): string

    protected get bg(): Color | Nil {
        return this._bg
    }

    get rect(): IRect {
        return this._rect
    }

    get insets(): IInsets {
        return this._insets
    }

    get inner(): IRect {
        return insetRect(this._insets, this._rect)
    }

    get debugName() {
        return `${this.name}: ${this.id}`
    }

    render(bounds?: Nullable<IRect>, bg?: Nullable<Color>): void {
        const rect = insetRect(this.insets, bounds)
    }
}

export class Panel extends BasePanel {
    protected readonly children: IPanel[] = []

    constructor(rect: IRect, insets: IInsets, bgColor?: Color) {
        super(rect, insets, bgColor)
    }

    add(child: IPanel) {
        this.children.push(child)
    }

    render(bounds?: Nullable<IRect>, bg?: Nullable<Color>): void {
        const bgc = fallbackBg(this.bg, bg)
        const rect = insetRect(this.insets, bounds ?? this.rect)
        fill(bgc, rect)

        for (const p of this.children) {
            p.render(rect, bgc)
        }
    }

    protected get name() {
        return Panel.name
    }
}

export interface ITextElement extends IPanel {
    readonly text: Color
}

export class TextPanel extends BasePanel {
    constructor(
        protected readonly text: Color,
        rect: IRect,
        insets = new Insets(),
        bg?: Nullable<Color>
    ) {
        super(rect, insets, bg?.bg)
    }

    protected get name() {
        return TextPanel.name
    }

    render(bounds?: IRect, bg?: Nullable<Color>) {
        const bgc = fallbackBg(this.bg, this.text.bg, bg)
        // this.fill(bg)
        const text = bgc.text(this.text)
        const rect = insetRect(this.insets, bounds)
        sys.cursor.cursorTo(rect.x, rect.y)
        sys.write(text.str)
    }

    // protected fallbackBg(fallback: Nullable<Color>): Color {
    //     return fallbackBg(this.bg, this.text.bg, fallback)
    // }
}

export class Marquee extends TextPanel {}

export class CreditsPanel extends Panel {}
