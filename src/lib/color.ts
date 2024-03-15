const codes = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',

    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
    bgGray: '\x1b[100m',
}

export type FgColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'
export type BgColor = 'bgBlack' | 'bgRed' | 'bgGreen' | 'bgYellow' | 'bgBlue' | 'bgMagenta' | 'bgCyan' | 'bgWhite' | 'bgGray'
export type ColorMod = 'bright' | 'dim' | 'underscore' | 'blink' | 'reverse' | 'hidden'
export type Stringable = { toString(): string }

export class Color implements Stringable {
    static text(str: Stringable) {
        return new Color(str)
    }

    static color(): Color
    static color(fgKey: FgColor): Color
    static color(fgKey: FgColor, bgKey: BgColor): Color
    static color(fgKey: FgColor, bgKey: BgColor, mod: ColorMod): Color
    static color(fgKey: FgColor | null, bgKey: BgColor | null, mod: ColorMod | null): Color
    static color(fgKey: FgColor | null = null, bgKey: BgColor | null = null, mod: ColorMod | null = null) {
        return new Color(null, fgKey, bgKey, mod)
    }

    static black(str: Stringable | null = null) {
        return new Color(str, 'black')
    }
    static red(str: Stringable | null = null) {
        return new Color(str, 'red')
    }
    static green(str: Stringable | null = null) {
        return new Color(str, 'green')
    }
    static yellow(str: Stringable | null = null) {
        return new Color(str, 'yellow')
    }
    static blue(str: Stringable | null = null) {
        return new Color(str, 'blue')
    }
    static magenta(str: Stringable | null = null) {
        return new Color(str, 'magenta')
    }
    static cyan(str: Stringable | null = null) {
        return new Color(str, 'cyan')
    }
    static white(str: Stringable | null = null) {
        return new Color(str, 'white')
    }
    static gray(str: Stringable | null = null) {
        return new Color(str, 'gray')
    }

    static bgBlack(str: Stringable | null = null) {
        return new Color(str, null, 'bgBlack')
    }
    static bgRed(str: Stringable | null = null) {
        return new Color(str, null, 'bgRed')
    }
    static bgGreen(str: Stringable | null = null) {
        return new Color(str, null, 'bgGreen')
    }
    static bgYellow(str: Stringable | null = null) {
        return new Color(str, null, 'bgYellow')
    }
    static bgBlue(str: Stringable | null = null) {
        return new Color(str, null, 'bgBlue')
    }
    static bgMagenta(str: Stringable | null = null) {
        return new Color(str, null, 'bgMagenta')
    }
    static bgCyan(str: Stringable | null = null) {
        return new Color(str, null, 'bgCyan')
    }
    static bgWhite(str: Stringable | null = null) {
        return new Color(str, null, 'bgWhite')
    }
    static bgGray(str: Stringable | null = null) {
        return new Color(str, null, 'bgGray')
    }

    static bright(str: Stringable | null = null) {
        return new Color(str, null, null, 'bright')
    }
    static dim(str: Stringable | null = null) {
        return new Color(str, null, null, 'dim')
    }
    static underscore(str: Stringable | null = null) {
        return new Color(str, null, null, 'underscore')
    }
    static blink(str: Stringable | null = null) {
        return new Color(str, null, null, 'blink')
    }
    static reverse(str: Stringable | null = null) {
        return new Color(str, null, null, 'reverse')
    }
    static hidden(str: Stringable | null = null) {
        return new Color(str, null, null, 'hidden')
    }

    static get br() {
        return this.bright()
    }

    static get dk() {
        return this.dim()
    }

    static get ul() {
        return this.underscore()
    }

    private _fgKey: FgColor | null = null
    private _bgKey: BgColor | null = null
    private _mod: ColorMod | null = null

    constructor()
    constructor(string: Stringable)
    constructor(string: Stringable, fgKey: FgColor)
    constructor(string: Stringable, fgKey: FgColor, bgKey: BgColor)
    constructor(string: Stringable, fgKey: FgColor, bgKey: BgColor, mod: ColorMod)
    constructor(string?: Stringable | null, fgKey?: FgColor | null, bgKey?: BgColor | null, mod?: ColorMod | null)
    constructor(
        readonly _text: Stringable | null = null,
        fgKey: FgColor | null = null,
        bgKey: BgColor | null = null,
        mod: ColorMod | null = null
    ) {
        this._fgKey = fgKey
        this._bgKey = bgKey
        this._mod = mod
    }

    toString() {
        const fg = this._fgKey != null ? codes[this._fgKey] ?? '' : ''
        const bg = this._bgKey != null ? codes[this._bgKey] ?? '' : ''
        const m = this._mod != null ? codes[this._mod] ?? '' : ''
        const t = this._text ?? ''
        return `${m}${fg}${t}${codes.reset}`
    }

    text(str: Stringable | null = null) {
        return new Color(str, this._fgKey, this._bgKey, this._mod)
    }

    color(): Color
    color(fgKey: FgColor): Color
    color(fgKey: FgColor, bgKey: BgColor): Color
    color(fgKey: FgColor, bgKey: BgColor, mod: ColorMod): Color
    color(fgKey?: FgColor | null, bgKey?: BgColor | null, mod?: ColorMod | null): Color
    color(fgKey: FgColor | null = null, bgKey: BgColor | null = null, mod: ColorMod | null = null) {
        return new Color(this._text, fgKey, bgKey, mod)
    }

    get str(): string {
        return this.toString()
    }

    get reset(): Color {
        return this.color()
    }

    randomFg(exclude: FgColor[] = ['black', 'white', 'gray']): Color {
        const colors: FgColor[] = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray']
        const result = colors.filter(x => !exclude.includes(x as FgColor))
        const index = Math.floor(result.length * Math.random())
        return new Color(this._text, result[index], this._bgKey, this._mod)
    }

    randomBg(exclude: BgColor[] = []): Color {
        const colors: BgColor[] = ['bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite', 'bgGray']
        const result = colors.filter(x => !exclude.includes(x as BgColor))
        const index = Math.floor(result.length * Math.random())
        return new Color(this._text, this._fgKey, result[index], this._mod)
    }

    get fgKey(): FgColor | null {
        return this._fgKey
    }

    get bgKey(): BgColor | null {
        return this._bgKey
    }

    get mod(): ColorMod | null {
        return this._mod
    }

    //
    // Colors
    //

    get black() {
        return new Color(this._text, 'black', null, this._mod)
    }
    get red() {
        return new Color(this._text, 'red', null, this._mod)
    }
    get green() {
        return new Color(this._text, 'green', null, this._mod)
    }
    get yellow() {
        return new Color(this._text, 'yellow', null, this._mod)
    }
    get blue() {
        return new Color(this._text, 'blue', null, this._mod)
    }
    get magenta() {
        return new Color(this._text, 'magenta', null, this._mod)
    }
    get cyan() {
        return new Color(this._text, 'cyan', null, this._mod)
    }
    get white() {
        return new Color(this._text, 'white', null, this._mod)
    }
    get gray() {
        return new Color(this._text, 'gray', null, this._mod)
    }

    get bgBlack() {
        return new Color(this._text, null, 'bgBlack', this._mod)
    }
    get bgRed() {
        return new Color(this._text, null, 'bgRed', this._mod)
    }
    get bgGreen() {
        return new Color(this._text, null, 'bgGreen', this._mod)
    }
    get bgYellow() {
        return new Color(this._text, null, 'bgYellow', this._mod)
    }
    get bgBlue() {
        return new Color(this._text, null, 'bgBlue', this._mod)
    }
    get bgMagenta() {
        return new Color(this._text, null, 'bgMagenta', this._mod)
    }
    get bgCyan() {
        return new Color(this._text, null, 'bgCyan', this._mod)
    }
    get bgWhite() {
        return new Color(this._text, null, 'bgWhite', this._mod)
    }
    get bgGray() {
        return new Color(this._text, null, 'bgGray', this._mod)
    }

    //
    // Mods
    //

    get bright() {
        return new Color(this._text, this._fgKey, null, 'bright')
    }
    get dim() {
        return new Color(this._text, this._fgKey, null, 'dim')
    }
    get underscore() {
        return new Color(this._text, this._fgKey, null, 'underscore')
    }
    get blink() {
        return new Color(this._text, this._fgKey, null, 'blink')
    }
    get reverse() {
        return new Color(this._text, this._fgKey, null, 'reverse')
    }
    get hidden() {
        return new Color(this._text, this._fgKey, null, 'hidden')
    }

    //
    // Alias
    //

    get br() {
        return this.bright
    }

    get ul() {
        return this.underscore
    }

    get rev() {
        return this.reverse
    }

    get hide() {
        return this.reverse
    }

    get show() {
        return this.text(this._text).color(this._fgKey, this._bgKey)
    }
}
