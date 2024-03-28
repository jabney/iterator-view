import { Nullable } from './nullable'
import { IPixel, Pixel } from './pixel'

export type Frame = Pixel[][]

export interface IRow {
    readonly str: string
    readonly length: number
    compare(pixel: Nullable<IPixel>, index: number): boolean
    get(col: number): IPixel | null
    set(col: number, pixel: IPixel): void
    clip(width: number): IRow
    render(): string
}

export class Row implements IRow {
    static fill(i: number, length: number, p: IPixel): Row {
        const row = new Row(i)
        row.pixels = new Array(length).fill(p)
        return row
    }

    private pixels: IPixel[] = []

    constructor(readonly index: number) {}

    get str() {
        return this.pixels.map(x => (x != null ? x.str : ' ')).join('')
    }

    get length() {
        return this.pixels.length
    }

    toString() {
        return this.str
    }

    get(col: number) {
        return this.pixels[col] ?? null
    }

    set(col: number, pixel: Pixel) {
        this.pixels[col] = pixel
    }

    render() {
        return this.pixels.map(p => p.str).join('')
    }

    clip(width: number): Row {
        if (this.pixels.length > width) {
            const row = new Row(this.index)
            row.pixels = this.pixels.slice(0, width)
        }
        return this
    }

    compare(other: Nullable<IPixel>, index: number): boolean {
        const self = this.pixels[index]

        if (self == null) {
            return other == null
        }
        if (other == null) {
            return self == null
        }
        return self.compareTo(other)
    }

    diff(other: IRow): number[] {
        const indices: number[] = []

        for (let i = 0; i < this.length; i++) {
            const p = this.pixels[i]

            if (other.compare(p, i)) {
                indices.push(i)
            }
            if (other.length > this.length) {
                const r = other.length - this.length
                for (let i = this.length; i < this.length + r; i++) {
                    indices.push(i)
                }
            }
        }

        return indices
    }
}
