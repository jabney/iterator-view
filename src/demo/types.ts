import { Interface } from 'readline'
import { Color } from '../lib/color'

export type AsyncFn<T = void> = () => Promise<T>

export type Disposer = () => void

export type Stringable = { toString(): string }

export interface IPoint {
    readonly x: number
    readonly y: number
}

type Immutable<T> = {
    readonly [key in keyof T]: T[key]
}

type Mutable<T> = {
    -readonly [key in keyof T]: T[key]
}

export interface ToMutable<T> {
    toMutable(): Mutable<T>
}

export class Point implements IPoint, ToMutable<IPoint> {
    static from(p: IPoint) {
        return new Point(p.x, p.y)
    }

    constructor(
        readonly x = 0,
        readonly y = 0
    ) {}

    toMutable(): Mutable<IPoint> {
        return { x: this.x, y: this.y }
    }
}

export interface IInsets {
    readonly top: number
    readonly left: number
    readonly bottom: number
    readonly right: number
}

export class Insets implements IInsets, ToMutable<IInsets> {
    static from(ins: IInsets) {
        return new Insets(ins.top, ins.left, ins.bottom, ins.right)
    }

    constructor(
        readonly top = 0,
        readonly left = 0,
        readonly bottom = 0,
        readonly right = 0
    ) {}

    toMutable(): Mutable<IInsets> {
        return { top: this.top, left: this.left, bottom: this.bottom, right: this.right }
    }
}

export interface IRect {
    readonly pos: IPoint
    readonly width: number
    readonly height: number
}

export class Rect implements IRect, ToMutable<IRect> {
    static from(r: IRect) {
        return new Rect(r.width, r.height, Point.from(r.pos))
    }

    constructor(
        readonly width = 0,
        readonly height = 0,
        readonly pos: IPoint = { x: 0, y: 0 }
    ) {
        pos = Point.from(pos)
    }

    toMutable(): Mutable<IRect> {
        return {
            width: this.width,
            height: this.height,
            pos: { x: this.pos.x, y: this.pos.y },
        }
    }
}

class ValueError extends Error {
    constructor(value: number | string) {
        super(`invalid value: ${value}`)
    }
}

export class Char {
    readonly code: number

    get str() {
        return String.fromCodePoint(this.code)
    }

    constructor(code: number)
    constructor(char: string)
    constructor(char: number | string)
    constructor(value: number | string) {
        if (typeof value === 'number') {
            this.code = value
        } else {
            this.code = value.codePointAt(0) ?? -1
            if (this.code < 0 || this.code >= 0x110000) throw new ValueError(value)
        }
    }
}

export interface IBorder {
    horz: Char
    vert: Char
}

export class Border implements IBorder {
    static from(horz: string, vert: string) {
        return new Border(new Char(horz), new Char(vert))
    }

    constructor(
        readonly horz: Char,
        readonly vert: Char
    ) {}
}

export interface IUnfoldItem {
    color: Color
    seconds?: number // seconds
    point?: Point
}

export interface ITitle {
    readonly rect: IRect
    readonly charX: string
    readonly charY: string
    readonly content: readonly Color[]
}
