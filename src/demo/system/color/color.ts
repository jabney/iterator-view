import { Bit24 } from './bit24'
import { Bit8 } from './bit8'

export class Color {
    readonly esc = `\x1b[`
    readonly reset = `\x1b[0m`

    // static bit8(byte: number) {
    //     return new Bit8(byte)
    // }
    // static bit24() {
    //     return new Bit24()
    // }
}
