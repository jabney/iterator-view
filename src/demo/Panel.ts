import { clamp } from '../lib/clamp'
import { Color } from '../lib/color'
import { System } from './system'
import { IInsets, IPoint, IRect, Insets, Point, Rect } from './types'
import { insetRect, clipRect } from './util'

const sys = new System()

interface IPanel {
    readonly rect: IRect
    readonly insets: IInsets
    render(bounds: IRect): void
    addChild(child: IPanel): void
}

abstract class BasePanel implements IPanel {
    protected readonly children: IPanel[] = []

    constructor(
        private _rect: IRect,
        private _insets: IInsets
    ) {}

    get rect(): IRect {
        return this._rect
    }

    get insets(): IInsets {
        return this._insets
    }

    get inner(): IRect {
        return insetRect(this._insets, this._rect)
    }

    addChild(child: IPanel) {
        this.children.push(child)
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

    abstract render(bounds?: IRect): void
}

export class Panel extends BasePanel {
    constructor(rect: IRect, insets: IInsets = new Insets()) {
        super(rect, insets)
    }

    render(): void {
        for (const p of this.children) {
            p.render(this.inner)
        }
    }
}

export interface ITextElement extends IPanel {
    readonly text: Color
}

export class TextPanel extends BasePanel {
    constructor(
        readonly text: Color,
        rect: IRect,
        insets = new Insets()
    ) {
        super(rect, insets)
    }

    render(bounds: IRect) {
        const rect = this.insetRect(bounds)
        sys.cursor.cursorTo(rect.pos.x, rect.pos.y)
        sys.write(this.text.reverse.str)
    }
}

export class Marquee extends TextPanel {}

export class CreditsPanel extends Panel {}
