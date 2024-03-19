import { Color } from '../../lib/color'
import { sys } from '../system/system'
import { IPanel, IInsets, IRect, Nullable, FillData } from '../types'
import { fallbackBg, fill, insetRect } from '../util'

export abstract class BasePanel implements IPanel {
    private readonly id: number
    protected cachedRect: Nullable<IRect> = null
    protected cachedBg: Nullable<Color> = null

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

    protected fallbackBg(...bg: Nullable<Color>[]) {
        return fallbackBg(this.bg, ...bg, new Color())
    }

    protected fill(bounds: IRect, bg?: Nullable<Color>): FillData {
        const rect = this.insetRect(bounds)
        const bgc = this.fallbackBg(bg)
        fill(bgc, rect)
        return [rect, bgc]
    }

    render(bounds: IRect, bg?: Nullable<Color>): FillData {
        this.cachedRect = bounds
        this.cachedBg = bg
        return this.fill(bounds, bg)
    }

    abstract destroy(): void
}
