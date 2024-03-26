export interface IInsets {
    readonly top: number
    readonly left: number
    readonly bottom: number
    readonly right: number
}

export class Insets implements IInsets {
    constructor(
        readonly top = 0,
        readonly left = 0,
        readonly bottom = 0,
        readonly right = 0
    ) {}
}
