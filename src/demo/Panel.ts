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

export class TextPanel extends BasePanel {
    protected readonly text: Color[]

    constructor(text: Color | Color[], insets = new Insets(), bg?: Nullable<Color>) {
        super(insets, bg?.bg)
        this.text = Array.isArray(text) ? text : [text]
    }

    protected get name() {
        return TextPanel.name
    }

    // resize(bounds: IRect, bg?: Nullable<Color>) {
    //     this.render(bounds, bg)
    // }

    render(bounds: IRect, bg?: Nullable<Color>) {
        const bgc = fallbackBg(this.bg, bg)
        const rect = insetRect(this.insets, bounds)
        fill(bgc, rect)

        const [text] = this.text
        sys.cursorTo(rect.x, rect.y)
        sys.write(text.bgFrom(bgc).str)
    }

    destroy() {}
}

// export class Marquee extends TextPanel {}

// export class CreditsPanel extends Panel {}
