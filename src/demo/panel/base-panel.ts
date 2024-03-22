import { Color } from '../../lib/color'
import { Context } from '../system/context'
import { sys } from '../system/system'
import { IPanel, IInsets, IRect, ContentAlign, Nullable } from '../types'
import { insetRect } from '../util'
import { Insets } from '../system/insets'

export abstract class BasePanel implements IPanel {
    private readonly id: number
    protected readonly align: ContentAlign

    constructor(
        private readonly insets: IInsets = new Insets(),
        protected readonly bg: Color | null = null,
        align?: Nullable<ContentAlign>
    ) {
        this.id = sys.nextId()
        this.align = { h: 'left', v: 'top', ...align }
    }

    protected abstract get name(): string

    get debugName() {
        return `${this.name}: ${this.id}`
    }

    protected insetRect(bounds: IRect) {
        return insetRect(this.insets, bounds)
    }

    abstract render(ctx: Context): void

    abstract destroy(): void
}
