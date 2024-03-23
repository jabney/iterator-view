import { Color } from './color'

/**
 * ESC[38;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB foreground color
 * ESC[48;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB background color
 */
export interface IRgb {
    r: number
    g: number
    b: number
}

export type RgbList = [r: number, g: number, b: number]

const esc = '\x1b['
const fg = `${esc}38;2;`
const bg = `${esc}48;2;`
const reset = `\x1b[0m`

export class Bit24 extends Color {
    constructor(
        readonly r: number,
        readonly g: number,
        readonly b: number
    ) {
        super()
        r = r & 0xff
        g = g & 0xff
        b = b & 0xff
    }

    toList(): RgbList {
        return [this.r, this.g, this.b]
    }

    toString() {}

    private get printable() {
        return `${esc}`
    }
}

function rgb() {
    const mode = { fg, bg }
    return (args: TemplateStringsArray, ...[r, g, b]: RgbList) => {
        const type = args[0] as keyof typeof mode
        const text = args[args.length - 1]

        return `${mode[type]}${r};${g};${b}m${args}${reset}`
    }
}

function template(_: TemplateStringsArray, ...rgb: RgbList) {
    return fg
    // return (...values) => {
    //   const dict = values[values.length - 1] || {};
    //   const result = [strings[0]];
    //   keys.forEach((key, i) => {
    //     const value = Number.isInteger(key) ? values[key] : dict[key];
    //     result.push(value, strings[i + 1]);
    //   });
    //   return result.join("");
    // };
}

// console.log(template`${255}${0}${255}`)
console.log(rgb()`fg${128}${0}${200}Jimmy Jimmy2`)
