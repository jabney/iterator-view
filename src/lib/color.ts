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

type ModType = 'bright' | 'dim' | 'underscore' | 'blink' | 'reverse' | 'hidden'
export type ColorKey = Exclude<keyof typeof codes, ModType | 'reset'>
export type ColorMod = Extract<keyof typeof codes, ModType>
export type Stringable = { toString(): string }

export class Color implements Stringable {
    static text(str: string) {
        return new Color(str)
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
    static bright(str: Stringable | null = null) {
        return new Color(str, null, 'bright')
    }
    static dim(str: Stringable | null = null) {
        return new Color(str, null, 'dim')
    }
    static underscore(str: Stringable | null = null) {
        return new Color(str, null, 'underscore')
    }
    static blink(str: Stringable | null = null) {
        return new Color(str, null, 'blink')
    }
    static reverse(str: Stringable | null = null) {
        return new Color(str, null, 'reverse')
    }
    static hidden(str: Stringable | null = null) {
        return new Color(str, null, 'hidden')
    }

    static color(key: ColorKey, mod: ColorMod | null = null) {
        return new Color(null, key, mod)
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

    static random(str: Stringable | null = null, mod?: ColorMod | null) {
        return new Color(str, 'random', mod ?? null)
    }

    private _key: ColorKey | null = null
    private _mod: ColorMod | null = null

    constructor()
    constructor(text: Stringable | null)
    constructor(text: Stringable | null, key: (ColorKey | 'random') | null)
    constructor(text: Stringable | null, key: (ColorKey | 'random') | null, mod: (ColorMod | 'random') | null)
    constructor(
        readonly string: Stringable | null = null,
        key: (ColorKey | 'random') | null = null,
        mod: (ColorMod | 'random') | null = null
    ) {
        this._key = key === 'random' ? this.randomKey() : key
        this._mod = mod === 'random' ? this.randomMod() : mod
    }

    toString() {
        const c = this._key != null ? codes[this._key] ?? '' : ''
        const m = this._mod != null ? codes[this._mod] ?? '' : ''
        const t = this.string ?? ''
        return `${m}${c}${t}${codes.reset}`
    }

    text(str: string) {
        return new Color(str, this._key, this._mod)
    }

    color(): Color
    color(key: ColorKey | null): Color
    color(key: ColorKey | null, mod: ColorMod | null): Color
    color(key: ColorKey | null = null, mod: ColorMod | null = null) {
        return new Color(this.string, key, mod)
    }

    get str(): string {
        return this.toString()
    }

    get reset(): Color {
        return this.color()
    }

    private randomKey(): ColorKey {
        const colors: ColorKey[] = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
        const index = Math.floor(colors.length * Math.random())
        return colors[index]
    }

    private randomMod(): ColorMod {
        const mods: ColorMod[] = ['bright', 'dim', 'underscore', 'reverse']
        const index = Math.floor(mods.length * Math.random())
        return mods[index]
    }

    get random(): Color {
        return this.color(this.randomKey(), this._mod)
    }

    get key(): string {
        return this._key ?? 'none'
    }

    get mod(): string {
        return this._mod ?? 'none'
    }

    //
    // Colors
    //

    get black() {
        return new Color(this.string, 'black', this._mod)
    }
    get red() {
        return new Color(this.string, 'red', this._mod)
    }
    get green() {
        return new Color(this.string, 'green', this._mod)
    }
    get yellow() {
        return new Color(this.string, 'yellow', this._mod)
    }
    get blue() {
        return new Color(this.string, 'blue', this._mod)
    }
    get magenta() {
        return new Color(this.string, 'magenta', this._mod)
    }
    get cyan() {
        return new Color(this.string, 'cyan', this._mod)
    }
    get white() {
        return new Color(this.string, 'white', this._mod)
    }
    get gray() {
        return new Color(this.string, 'gray', this._mod)
    }

    //
    // Mods
    //

    get bright() {
        return new Color(this.string, this._key, 'bright')
    }
    get dim() {
        return new Color(this.string, this._key, 'dim')
    }
    get underscore() {
        return new Color(this.string, this._key, 'underscore')
    }
    get blink() {
        return new Color(this.string, this._key, 'blink')
    }
    get reverse() {
        return new Color(this.string, this._key, 'reverse')
    }
    get hidden() {
        return new Color(this.string, this._key, 'hidden')
    }

    //
    // Alias
    //

    get br() {
        return this.bright
    }

    get dk() {
        return this.dim
    }

    get ul() {
        return this.underscore
    }
}
