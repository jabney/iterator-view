import { enumerate } from '../../iterator'
import { Color } from '../../lib/color'
import { Disposer } from '../../lib/disposer'
import { sys } from '../system/system'
import { IInsets, IPanel, IRect, KeyType, Nullable } from '../types'
import { heightIterator } from '../util'
import { BasePanel } from './base-panel'

export interface IUIPanel extends IPanel {}

export interface UICheckItem {
    readonly type: string
    readonly group: string
    readonly text: Color
}

interface UICheckState extends UICheckItem {
    selected: boolean
}

export class UIPanel extends BasePanel implements UIPanel {
    protected readonly children: IPanel[] = []
    private readonly items: UICheckState[]
    private readonly disposer = new Disposer()
    private index: number = 0

    constructor(options: UICheckItem[], insets: IInsets, bgColor?: Color) {
        super(insets, bgColor ?? new Color())
        this.items = options.map(x => ({ ...x, selected: Math.random() < 0.5 ? false : false }))
        this.handleInput()
    }

    protected get name() {
        return UIPanel.name
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

    add(child: IUIPanel) {
        this.children.push(child)
    }

    render(bounds: IRect, bg?: Nullable<Color>): void {
        const [rect, bgc] = this.fill(bounds, bg)

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
        for (const p of this.children) {
            p.destroy()
        }
        while (this.children.pop());
        this.disposer.destroy()
    }
}
