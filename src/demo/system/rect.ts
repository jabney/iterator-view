import { IRect } from '../types'

export class Rect implements IRect {
    static from = (r: IRect) => new Rect(r.width, r.height, r.x, r.y)

    constructor(
        readonly width = 0,
        readonly height = 0,
        readonly x = 0,
        readonly y = 0
    ) {}

    empty() {
        return this.width === 0 || this.height === 0
    }
}
