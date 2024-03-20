import { Color } from '../lib/color'
import { IContext } from './system/context'
import { Keyboard } from './system/kb'

export type KeysOf<T extends object> = { [K in keyof T]: K }[keyof T]

export type Immutable<T> = {
    readonly [key in keyof T]: T[key]
}

export type Mutable<T> = {
    -readonly [key in keyof T]: T[key]
}

export type AsyncFn<T = void> = () => Promise<T>

export type DisposeFn = () => void

export type Stringable = { toString(): string }

export type Nil = null | undefined

export type Nullable<T> = T | Nil

export type WindowSize = { cols: number; lines: number }

export type KeyType = KeysOf<Keyboard>

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

export type FillData = readonly [IRect, Color]

export interface IPanel {
    render(ctx: IContext): void
    destroy(): void
}

export interface IUiPanel extends IPanel {}

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
