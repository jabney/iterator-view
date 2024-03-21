import { enumerate } from '../../iterator'
import { Color } from '../../lib/color'
import { Disposer } from '../../lib/disposer'
import { Context } from '../system/context'
import { sys } from '../system/system'
import { IInsets, IPanel, IUiPanel, KeyType, Nullable } from '../types'
import { fallbackBg, heightIterator } from '../util'
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

    private checkState(option: UICheckState) {
        return option.selected ? '[x] ' : '[ ] '
    }

    private textState(index: number, text: Color) {
        return index === this.index ? text.reverse : text
    }

    render(ctx: Context): void {
        const rect = this.insetRect(ctx.rect)

        if (this.bg) {
            ctx.fill(this.bg, rect)
        }
        const bgc = fallbackBg(this.bg, ctx.bg)
        const opts = enumerate(this.items)

        for (const line of heightIterator(rect, 'even')) {
            const it = opts.next()

            if (!it.done) {
                const [i, opt] = it.value
                const text = opt.text.bgFrom(bgc)
                let x = rect.x
                x = ctx.write(x, line, text.text(this.checkState(opt)))
                ctx.write(x, line, this.textState(i, text))
            }
        }
    }

    destroy() {
        this.disposer.destroy()
        super.destroy()
    }
}
