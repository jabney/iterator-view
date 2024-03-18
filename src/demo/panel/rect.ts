import { IRect } from '../types'

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
}
