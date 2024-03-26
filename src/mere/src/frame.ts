import { IInsets, Insets } from './insets'
import { IRect } from './rect'

export interface IFrame {
    readonly rect: IRect
    readonly insets: IInsets
}

/**
 *
 */
export class Frame implements IFrame {
    constructor(
        readonly rect: IRect,
        readonly insets = new Insets()
    ) {}
}
