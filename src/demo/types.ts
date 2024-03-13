import { Color } from '../lib/color'

export type AsyncFn<T = void> = () => Promise<T>

export interface IPoint {
    readonly x: number
    readonly y: number
}

export class Point implements IPoint {
    static from(p: IPoint) {
        return new Point(p.x, p.y)
    }

    constructor(
        readonly x = 0,
        readonly y = 0
    ) {}
}

export interface IRect {
    readonly pos: IPoint
    readonly width: number
    readonly height: number
}

export class Rect implements IRect {
    // static from(r: IRect) {
    //     return new Rect(r.width, r.height, { x: r.pos.x, y: r.pos.y })
    // }

    constructor(
        readonly width = 0,
        readonly height = 0,
        readonly pos: IPoint = { x: 0, y: 0 }
    ) {}
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
