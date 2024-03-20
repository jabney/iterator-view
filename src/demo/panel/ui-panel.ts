import { enumerate } from '../../iterator'
import { Color } from '../../lib/color'
import { Disposer } from '../../lib/disposer'
import { Context } from '../system/context'
import { sys } from '../system/system'
import { IInsets, IPanel, IUiPanel, KeyType, Nullable } from '../types'
import { fallbackBg, fill, heightIterator } from '../util'
import { BasePanel } from './base-panel'

export interface UICheckItem {
    readonly text: Color
    readonly default?: Nullable<boolean>
}

interface UICheckState extends UICheckItem {
    selected: boolean
}

export abstract class UIPanel extends BasePanel implements IUiPanel {
    protected readonly children: IUiPanel[] = []

    protected get name(): string {
        return UIPanel.name
    }

    add(child: IPanel) {
        this.children.push(child)
    }

    abstract render(ctx: Context): void

    destroy() {
        for (const p of this.children) {
            p.destroy()
        }
        while (this.children.pop());
    }
}

export class UICheckPanel extends UIPanel {
    protected readonly children: IPanel[] = []
    private readonly items: UICheckState[]
    private readonly disposer = new Disposer()
    private index: number = 0

    constructor(options: UICheckItem[], insets: IInsets, bgColor?: Color) {
        super(insets, bgColor)
        this.items = options.map(x => ({ ...x, selected: x.default ?? false }))
        this.handleInput()
    }

    protected get name() {
        return UICheckPanel.name
    }

    protected get highlighted() {
        return this.items[this.index]
    }

    protected handleInput() {
        const dispose = sys.addInputListener((key: KeyType) => {
            switch (key) {
                case 'up':
                    this.index = this.index > 0 ? this.index - 1 : this.items.length - 1
                    break
                case 'down':
                    this.index = this.index < this.items.length - 1 ? this.index + 1 : 0
                    break
                case 'space':
                    this.highlighted.selected = !this.highlighted.selected
            }
            sys.redraw()
        })

        this.disposer.add(dispose)
    }

    protected wrap(o: UICheckState, index: number, bg: Color) {
        const hl = index === this.index ? bg.reverse : bg
        const text = hl.text(o.text).str
        return o.selected ? `[x] ${text}` : `[ ] ${text}`
    }

    render(ctx: Context): void {
        const rect = this.insetRect(ctx.rect)

        if (this.bg) {
            fill(this.bg, rect)
        }
        const bgc = fallbackBg(this.bg, ctx.bg)

        const opts = enumerate(this.items)
        for (const line of heightIterator(rect, 'even')) {
            const it = opts.next()

            if (!it.done) {
                const [i, opt] = it.value
                const item = this.wrap(opt, i, bgc)
                sys.cursorTo(rect.x, line)
                sys.write(bgc.text(item).str)
            }
        }
    }

    destroy() {
        this.disposer.destroy()
        super.destroy()
    }
}
