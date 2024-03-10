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

type Mods = 'bright' | 'dim' | 'underscore' | 'blink' | 'reverse' | 'hidden'
type ColorKey = Exclude<keyof typeof codes, Mods | 'reset'>
type ColorMod = Extract<keyof typeof codes, Mods>
type Stringable = { toString(): string }

export class Color {
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

    static get br() {
        return this.bright()
    }

    static get dk() {
        return this.dim()
    }

    static get ul() {
        return this.underscore()
    }

    constructor()
    constructor(text: Stringable | null)
    constructor(text: Stringable | null, key: ColorKey | null)
    constructor(text: Stringable | null, key: ColorKey | null, mod: ColorMod | null)
    constructor(
        private readonly string: Stringable | null = null,
        private readonly key: ColorKey | null = null,
        private readonly mod: ColorMod | null = null
    ) {}

    toString() {
        const c = this.key != null ? codes[this.key] ?? '' : ''
        const m = this.mod != null ? codes[this.mod] ?? '' : ''
        const t = this.string ?? ''
        return `${m}${c}${t}${codes.reset}`
    }

    text(str: string) {
        return new Color(str, this.key, this.mod)
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

    //
    // Colors
    //

    get black() {
        return new Color(this.string, 'black', this.mod)
    }
    get red() {
        return new Color(this.string, 'red', this.mod)
    }
    get green() {
        return new Color(this.string, 'green', this.mod)
    }
    get yellow() {
        return new Color(this.string, 'yellow', this.mod)
    }
    get blue() {
        return new Color(this.string, 'blue', this.mod)
    }
    get magenta() {
        return new Color(this.string, 'magenta', this.mod)
    }
    get cyan() {
        return new Color(this.string, 'cyan', this.mod)
    }
    get white() {
        return new Color(this.string, 'white', this.mod)
    }
    get gray() {
        return new Color(this.string, 'gray', this.mod)
    }

    //
    // Mods
    //

    get bright() {
        return new Color(this.string, this.key, 'bright')
    }
    get dim() {
        return new Color(this.string, this.key, 'dim')
    }
    get underscore() {
        return new Color(this.string, this.key, 'underscore')
    }
    get blink() {
        return new Color(this.string, this.key, 'blink')
    }
    get reverse() {
        return new Color(this.string, this.key, 'reverse')
    }
    get hidden() {
        return new Color(this.string, this.key, 'hidden')
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
