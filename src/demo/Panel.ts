import { count } from '../iterator'
import { Color } from '../lib/color'
import { System } from './system'
import { IInsets, IPoint, IRect, Insets, Nil, Nullable, Point, Rect } from './types'
import { insetRect, clipRect } from './util'

const sys = new System()

interface IPanel {
    readonly rect: IRect
    readonly insets: IInsets
    render(bounds: IRect, hostBg: Nullable<Color>): void
}

abstract class BasePanel implements IPanel {
    constructor(
        private _rect: IRect,
        private _insets: IInsets,
        private _bg: Color | Nil = null
    ) {}

    protected get bg(): Color | Nil {
        return this._bg
    }

    get rect(): IRect {
        return this._rect
    }

    get insets(): IInsets {
        return this._insets
    }

    get inner(): IRect {
        return insetRect(this._insets, this._rect)
    }

    protected clipRect(child: IRect): IRect {
        return clipRect(this.inner, child)
    }

    protected insetRect(bounds: IRect): IRect {
        return insetRect(this.insets, bounds)
    }

    protected offsetRect(child: IRect, clip = false): IRect {
        const { width, height, pos } = this.rect

        if (clip) {
            return this.clipRect(child)
        } else {
            return new Rect(width, height, new Point(pos.x + child.pos.x, pos.y + child.pos.y))
        }
    }

    protected fill(bg?: Nullable<Color>) {
        const bgc = this.fallbackBg(bg, this._bg)
        for (const { x, y } of this.rowIterator()) {
            sys.cursor.cursorTo(x, y)
            sys.write(bgc.text(this.row).str)
        }
    }

    protected get row(): string {
        return ' '.repeat(this.rect.width)
    }

    protected *rowIterator(): IterableIterator<IPoint> {
        const x = this.rect.pos.x

        for (const row of count(this.rect.height)) {
            const y = this.rect.pos.y + row
            yield { x: this.rect.pos.x, y }
        }
    }

    protected fallbackBg(...args: (Color | Nil)[]): Color {
        for (const c of args.filter((x): x is Color => x != null)) {
            if (c.hasBg) return c.bg
        }
        return new Color()
    }

    abstract render(bounds?: IRect | null, hostBg?: Color | null): void
}

export class Panel extends BasePanel {
    protected readonly children: IPanel[] = []

    constructor(rect: IRect, insets: IInsets, bgColor?: Color) {
        super(rect, insets, bgColor)
    }

    addChild(child: IPanel) {
        this.children.push(child)
    }

    render(bounds?: Nullable<IRect>, bg?: Nullable<Color>): void {
        this.fill(bg)
        for (const p of this.children) {
            p.render(this.inner, this.bg)
        }
    }

    private debug() {
        sys.write(`rect: ${this.rect.width} x ${this.rect.height}, x:${this.rect.pos.x} y:${this.rect.pos.y}`)
    }
}

export interface ITextElement extends IPanel {
    readonly text: Color
}

export class TextPanel extends BasePanel {
    constructor(
        protected readonly text: Color,
        rect: IRect,
        insets = new Insets(),
        bg?: Nullable<Color>
    ) {
        super(rect, insets, bg?.bg)
    }

    render(bounds: IRect, bg?: Nullable<Color>) {
        const bgc = this.fallbackBg(bg)
        this.fill(bg)
        const text = bgc.text(this.text)
        const rect = this.insetRect(bounds)
        sys.cursor.cursorTo(rect.pos.x, rect.pos.y)
        sys.write(text.str)
    }

    protected fallbackBg(fallback: Nullable<Color>): Color {
        return super.fallbackBg(this.bg, this.text.bg, fallback)
    }
}

export class Marquee extends TextPanel {}

export class CreditsPanel extends Panel {}
