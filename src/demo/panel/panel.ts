import { Color } from '../../lib/color'
import { Ctx, IInsets, IPanel } from '../types'
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

    render(ctx: Ctx): void {
        const rect = this.insetRect(ctx.rect)

        if (this.bg != null) {
            fill(this.bg, rect)
        }

        for (const p of this.children) {
            p.render({ rect, bg: this.bg ?? ctx.bg })
        }
    }

    destroy() {
        for (const p of this.children) {
            p.destroy()
        }
        while (this.children.pop());
    }
}
