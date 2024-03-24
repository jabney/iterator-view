import { Nullable } from '../../types'
import { IPixel, Pixel } from '../pixel'

export type Frame = Pixel[][]

export interface IRow {
    readonly str: string
    readonly length: number
    compare(pixel: Nullable<IPixel>, index: number): boolean
    set(col: number, pixel: IPixel): void
}

export class Row implements IRow {
    readonly pixels: Pixel[] = []

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

    set(col: number, pixel: Pixel) {
        this.pixels[col] = pixel
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
