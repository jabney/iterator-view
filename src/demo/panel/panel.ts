import { enumerate } from '../../iterator'
import { Color } from '../../lib/color'
import { sys } from '../system/system'
import { IInsets, IPanel, IRect, Nullable } from '../types'
import { insetRect, fill, fallbackBg } from '../util'
import { Insets } from './insets'

export abstract class BasePanel implements IPanel {
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

// export class Marquee extends TextPanel {}

// export class CreditsPanel extends Panel {}
