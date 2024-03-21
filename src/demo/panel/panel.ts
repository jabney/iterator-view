import { Color } from '../../lib/color'
import { Context } from '../system/context'
import { IInsets, IPanel } from '../types'
import { fill } from '../util'
import { BasePanel } from './base-panel'

export class Panel extends BasePanel {
    protected readonly children: IPanel[] = []

    constructor(insets: IInsets, bg?: Color) {
        super(insets, bg)
    }

    protected get name() {
        return Panel.name
    }

    add(child: IPanel) {
        this.children.push(child)
    }

    render(ctx: Context): void {
        const rect = this.insetRect(ctx.rect)

        if (this.bg != null) {
            ctx.fill(this.bg, rect)
        }

        for (const p of this.children) {
            p.render(new Context(ctx, rect, this.bg ?? ctx.bg))
        }
    }

    destroy() {
        for (const p of this.children) {
            p.destroy()
        }
        while (this.children.pop());
    }
}
