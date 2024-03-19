import { Color } from '../../lib/color'
import { sys } from '../system/system'
import { IPanel, IInsets, IRect, Nullable } from '../types'
import { fallbackBg, fill, insetRect } from '../util'

export abstract class BasePanel implements IPanel {
    private readonly id: number

    constructor(
        private _insets: IInsets,
        private _bg: Color | null = null
    ) {
        this.id = sys.nextId()
    }

    protected abstract get name(): string

    get debugName() {
        return `${this.name}: ${this.id}`
    }

    protected get bg(): Color | null {
        return this._bg
    }

    protected get insets(): IInsets {
        return this._insets
    }

    protected insetRect(bounds: IRect) {
        return insetRect(this.insets, bounds)
    }

    protected fill(bounds: IRect, bg?: Nullable<Color>): [IRect, Color] {
        const rect = this.insetRect(bounds)
        const bgc = fallbackBg(this.bg, bg, new Color())
        fill(bgc, rect)
        return [rect, bgc]
    }

    // abstract resize(bounds: IRect, bg: Color): void

    // render(bounds: IRect, bg?: Nullable<Color>): void {
    //     this.fill(bounds, this.bg ?? bg)
    // }

    abstract render(bounds: IRect, bg?: Nullable<Color>): void

    abstract destroy(): void
}
