import { Color } from '../../lib/color'
import { Context } from '../system/context'
import { sys } from '../system/system'
import { IPanel, IInsets, IRect } from '../types'
import { insetRect } from '../util'
import { Insets } from '../system/insets'

export abstract class BasePanel implements IPanel {
    private readonly id: number

    constructor(
        private readonly insets: IInsets = new Insets(),
        protected readonly bg: Color | null = null
    ) {
        this.id = sys.nextId()
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
