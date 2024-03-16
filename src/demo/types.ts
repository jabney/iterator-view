import { Color } from '../lib/color'

export type AsyncFn<T = void> = () => Promise<T>

export type Disposer = () => void

export type Stringable = { toString(): string }

export type Nil = null | undefined

export type Nullable<T> = T | Nil

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
    constructor(
        readonly x: number = 0,
        readonly y: number = 0
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
    static from(tr: IPoint, bl: IPoint) {
        return new Insets(tr.y, tr.x, bl.y, bl.x)
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
    readonly width: number
    readonly height: number
    readonly x: number
    readonly y: number
}

export class Rect implements IRect, ToMutable<IRect> {
    constructor(
        readonly width = 0,
        readonly height = 0,
        readonly x = 0,
        readonly y = 0
    ) {}

    toMutable(): Mutable<IRect> {
        return {
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y,
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
