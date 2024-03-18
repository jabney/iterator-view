import { IInsets, Nullable, IPoint } from '../types'

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
}
