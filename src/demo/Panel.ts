import { Color } from '../lib/color'
import { sys } from './system'
import { IInsets, IPanel, IRect, Insets, Nullable } from './types'
import { insetRect, fill, fallbackBg } from './util'

abstract class BasePanel implements IPanel {
    private readonly id: number

    constructor(
        private _rect: IRect,
        private _insets: IInsets,
        private _bg: Color
    ) {
        this.id = sys.nextId()
    }

    protected abstract get name(): string

    protected get bg(): Color | null {
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

    resize() {
        // console.log('base panel resize')
    }

    abstract render(bounds?: Nullable<IRect>, bg?: Nullable<Color>): void
}

export class Panel extends BasePanel {
    protected readonly children: IPanel[] = []

    constructor(rect: IRect, insets: IInsets, bgColor?: Color) {
        super(rect, insets, bgColor ?? new Color())
    }

    add(child: IPanel) {
        this.children.push(child)
    }

    render(bounds?: Nullable<IRect>, bg?: Nullable<Color>): void {
        const rect = bounds ?? this.rect
        const bgc = fallbackBg(this.bg, bg)
        const insRect = insetRect(this.insets, rect)
        fill(bgc, rect)

        for (const p of this.children) {
            p.render(insRect, bgc)
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
        super(rect, insets, bg?.bg ?? text.bg ?? new Color())
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
