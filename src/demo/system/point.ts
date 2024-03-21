import { IPoint } from '../types'

export class Point implements IPoint {
    constructor(
        readonly x: number = 0,
        readonly y: number = 0
    ) {}
}
