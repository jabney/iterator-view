import { enumerate } from '../../iterator'
import { Color } from '../../lib/color'
import { Disposer } from '../../lib/disposer'
import { sys } from '../system/system'
import { FillData, IInsets, IPanel, IRect, IUiPanel, KeyType, Nullable } from '../types'
import { heightIterator } from '../util'
import { BasePanel } from './base-panel'

export interface UICheckItem {
    readonly text: Color
    readonly default?: Nullable<boolean>
}

interface UICheckState extends UICheckItem {
    selected: boolean
}

export class UIPanel extends BasePanel implements IUiPanel {
    protected readonly children: IUiPanel[] = []

    protected get name(): string {
        return UIPanel.name
    }

    add(child: IPanel) {
        this.children.push(child)
    }

    render(bounds: IRect, bg?: Nullable<Color>): FillData {
        return super.render(bounds, bg)
    }

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
        super(insets, bgColor ?? new Color())
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
            sys.render()
        })

        this.disposer.add(dispose)
    }

    protected wrap(o: UICheckState, index: number, bg: Color) {
        const hl = index === this.index ? bg.rev : bg
        const text = hl.text(o.text).str
        return o.selected ? `[x] ${text}` : `[ ] ${text}`
    }

    render(bounds: IRect, bg?: Nullable<Color>): FillData {
        const [rect, bgc] = super.render(bounds, bg)

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
        return [rect, bgc]
    }

    destroy() {
        this.disposer.destroy()
        super.destroy()
    }
}
