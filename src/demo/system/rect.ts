import { IRect, PointList, RectPoints } from '../types'

export class Rect implements IRect {
    static readonly empty = new Rect(0, 0, 0, 0)

    static from(r: IRect) {
        return new Rect(r.width, r.height, r.x, r.y)
    }

    static fromList(p: PointList) {
        const [x1, y1, x2, y2] = p
        return new Rect(x2 - x1, y2 - y1, x1, y1)
    }

    static fromPoints(p: RectPoints) {
        return new Rect(p.x2 - p.x1, p.y2 - p.y1, p.x1, p.y1)
    }

    static area(r: IRect) {
        return r.width * r.height
    }

    static hasArea(r: IRect) {
        return Rect.area(r) > 0
    }

    constructor(
        readonly width = 0,
        readonly height = 0,
        readonly x = 0,
        readonly y = 0
    ) {}

    get area() {
        return this.width * this.height
    }

    get hasArea() {
        return this.area > 0
    }

    toList(): PointList {
        const { x, y, width, height } = this
        return [x, y, x + width, y + height]
    }

    toPoints(): RectPoints {
        const { x, y, width, height } = this
        return { x1: x, y1: y, x2: x + width, y2: y + height }
    }

    /**
     * Return a bounding rect of this and rect.
     */
    expand(rect: IRect): Rect {
        let [x1, x2, y1, y2] = this.toList()
        x1 = Math.min(x1, rect.x)
        y1 = Math.min(y1, rect.y)
        x2 = Math.max(x2, rect.x + rect.width)
        y2 = Math.max(y2, rect.y + rect.height)
        return Rect.fromList([x1, y1, x2, y2])
    }

    /**
     * Clip rect with this.
     */
    clip(rect: IRect): Rect {
        const x1 = Math.max(rect.x, this.x)
        const y1 = Math.max(rect.y, this.y)
        const x2 = Math.min(rect.x + rect.width, this.x + this.width)
        const y2 = Math.min(rect.y + rect.height, this.y + this.height)
        if (x1 < x2 && y1 < y2) return Rect.fromList([x1, y1, x2, y2])
        return Rect.empty
    }

    hitTest(x: number, y: number): boolean {
        const p = this.toPoints()
        return x >= p.x1 && y > p.y1 && x < p.x2 && y < p.y2
    }
}
