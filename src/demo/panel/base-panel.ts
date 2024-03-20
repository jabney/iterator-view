import { Color } from '../../lib/color'
import { sys } from '../system/system'
import { IPanel, IInsets, IRect, Ctx } from '../types'
import { insetRect } from '../util'
import { Insets } from './insets'

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

    abstract render(ctx: Ctx): void

    abstract destroy(): void
}