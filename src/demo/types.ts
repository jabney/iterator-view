import { Color } from '../lib/color'

export type AsyncFn<T = void> = () => Promise<T>

export type Disposer = () => void

export type Stringable = { toString(): string }

export type Nil = null | undefined

export type Nullable<T> = T | Nil

export type WindowSize = { cols: number; lines: number }

export type Immutable<T> = {
    readonly [key in keyof T]: T[key]
}

export type Mutable<T> = {
    -readonly [key in keyof T]: T[key]
}

export interface IPoint {
    readonly x: number
    readonly y: number
}

export interface IInsets {
    readonly top: number
    readonly left: number
    readonly bottom: number
    readonly right: number
}

export interface IRect {
    readonly width: number
    readonly height: number
    readonly x: number
    readonly y: number
}

export interface IPanel {
    readonly insets: IInsets
    render(bounds: IRect, bg?: Nullable<Color>): void
    destroy(): void
}

export type hAlign = 'left' | 'center' | 'right'
export type vAlign = 'top' | 'middle' | 'bottom'

export interface TextAlign {
    h: hAlign
    v: vAlign
}

class ValueError extends Error {
    constructor(value: number | string) {
        super(`invalid value: ${value}`)
    }
}

class Char {
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

export interface IUnfoldItem {
    color: Color
    seconds?: number // seconds
    point?: IPoint
}

export interface ITitle {
    readonly rect: IRect
    readonly charX: string
    readonly charY: string
    readonly content: readonly Color[]
}