import { Color } from '../lib/color'

export type AsyncFn<T = void> = () => Promise<T>

export type Disposer = () => void

export type Stringable = { toString(): string }

export type Nil = null | undefined

export type Nullable<T> = T | Nil

export type WindowSize = { cols: number; lines: number }

// ---------------------
// Event System
//
interface KeyboardEvent {
    type: 'keyboard'
    data: WindowSize
}

interface TimerEvent {
    type: 'timer'
    data: number
}

export type Event = KeyboardEvent | TimerEvent

/**
 * Maps events to a union of their types.
 *
 * Interpretation
 *   - [K in keyof Event]: Event[K] crates a type where the proprties are unionized.
 *   - ['type'] pulls the type union off of the mapped type
 */
export type EventType = { [K in keyof Event]: Event[K] }['type']

/**
 * Maps events to their data type for a given EventType
 *
 * Interpretaion:
 *   - [T in Event as T['type']] creates a union of events which can be discriminated based on type
 *   - :T['data'] maps these to the 'data' key union
 *   - [K] selects the one that matches T['type']
 */
export type EventData<K extends EventType> = { [T in Event as T['type']]: T['data'] }[K]
//
// ---------------------

export interface ISystem {
    addEventListener<T extends EventType>(event: T, fn: (data: EventData<T>) => void): Disposer
}

export interface IPanel {
    readonly insets: IInsets
    // resize(bounds: IRect, bg: Color): void
    render(bounds: IRect, bg?: Nullable<Color>): void
    destroy(): void
}

export interface IPoint {
    readonly x: number
    readonly y: number
}

export type Immutable<T> = {
    readonly [key in keyof T]: T[key]
}

export type Mutable<T> = {
    -readonly [key in keyof T]: T[key]
}

interface ToMutable<T> {
    toMutable(): Mutable<T>
}

export class Point implements IPoint {
    constructor(
        readonly x: number = 0,
        readonly y: number = 0
    ) {}

    // toMutable(): Mutable<IPoint> {
    //     return { x: this.x, y: this.y }
    // }
}

export interface IInsets {
    readonly top: number
    readonly left: number
    readonly bottom: number
    readonly right: number
}

export class Insets implements IInsets {
    static from(tr: IPoint, bl: IPoint, aspect?: Nullable<boolean>) {
        return new Insets(tr.y, tr.x, bl.y, bl.x)
    }

    constructor(
        readonly top = 0,
        readonly left = 0,
        readonly bottom = 0,
        readonly right = 0
    ) {}

    // toMutable(): Mutable<IInsets> {
    //     return { top: this.top, left: this.left, bottom: this.bottom, right: this.right }
    // }
}

export interface IRect {
    readonly width: number
    readonly height: number
    readonly x: number
    readonly y: number
}

export class Rect implements IRect {
    constructor(
        readonly width = 0,
        readonly height = 0,
        readonly x = 0,
        readonly y = 0
    ) {}

    empty() {
        return this.width === 0 || this.height === 0
    }

    // toMutable(): Mutable<IRect> {
    //     return {
    //         width: this.width,
    //         height: this.height,
    //         x: this.x,
    //         y: this.y,
    //     }
    // }
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
