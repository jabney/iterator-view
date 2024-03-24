import { Color } from '../lib/color'
import { IContext } from './system/context'
import { Keyboard } from './system/kb'
import { IRect } from './system/rect'

export { IRect }

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

export type Range<T> = [T, T]

export type PointList = [x1: number, y1: number, x2: number, y2: number]

export type RectPoints = { x1: number; y1: number; x2: number; y2: number }

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

export type FillData = readonly [IRect, Color]

export interface IPanel {
    render(ctx: IContext): void
    destroy(): void
}

export interface IUiPanel extends IPanel {}

export type hAlign = 'left' | 'center' | 'right'
export type vAlign = 'top' | 'middle' | 'bottom'

export interface ContentAlign {
    h: hAlign
    v: vAlign
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
