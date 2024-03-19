import { Color } from '../../lib/color'
import { IInsets, IPanel, IRect, Nullable } from '../types'
import { BasePanel } from './base-panel'

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
        const [rect, bgc] = this.fill(bounds, bg)

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
