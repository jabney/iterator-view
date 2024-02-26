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

type ColorKey = keyof typeof codes
type ColorMod = Extract<ColorKey, 'bright' | 'dim' | 'underscore'>

export class Color {
    static string(str: string) {
        return new Color(str)
    }
    static color(str: string): Color
    static color(str: string, key: ColorKey): Color
    static color(str: string, key: ColorKey, mod: ColorMod): Color
    static color(str: string, key: ColorKey | null = null, mod: ColorMod | null = null) {
        return new Color(str, key, mod)
    }

    static black = (str: string) => this.color(str, 'black')
    static red = (str: string) => this.color(str, 'red')
    static green = (str: string) => this.color(str, 'green')
    static yellow = (str: string) => this.color(str, 'yellow')
    static blue = (str: string) => this.color(str, 'blue')
    static magenta = (str: string) => this.color(str, 'magenta')
    static cyan = (str: string) => this.color(str, 'cyan')
    static white = (str: string) => this.color(str, 'white')
    static gray = (str: string) => this.color(str, 'gray')
    static reset = (str: string) => this.color(str, 'reset')
    static bright = (str: string) => this.color(str, 'bright')
    static dim = (str: string) => this.color(str, 'dim')
    static underscore = (str: string) => this.color(str, 'underscore')
    static blink = (str: string) => this.color(str, 'blink')
    static reverse = (str: string) => this.color(str, 'reverse')
    static hidden = (str: string) => this.color(str, 'hidden')

    static readonly br = Object.freeze({
        red: (str: string) => this.color(str, 'red', 'bright'),
        green: (str: string) => this.color(str, 'green', 'bright'),
        yellow: (str: string) => this.color(str, 'yellow', 'bright'),
        blue: (str: string) => this.color(str, 'blue', 'bright'),
        magenta: (str: string) => this.color(str, 'magenta', 'bright'),
        cyan: (str: string) => this.color(str, 'cyan', 'bright'),
        white: (str: string) => this.color(str, 'white', 'bright'),
        gray: (str: string) => this.color(str, 'gray', 'bright'),
        reset: (str: string) => this.color(str, 'reset', 'bright'),
    })
    static readonly dk = Object.freeze({
        red: (str: string) => this.color(str, 'red', 'dim'),
        green: (str: string) => this.color(str, 'green', 'dim'),
        yellow: (str: string) => this.color(str, 'yellow', 'dim'),
        blue: (str: string) => this.color(str, 'blue', 'dim'),
        magenta: (str: string) => this.color(str, 'magenta', 'dim'),
        cyan: (str: string) => this.color(str, 'cyan', 'dim'),
        white: (str: string) => this.color(str, 'white', 'dim'),
        gray: (str: string) => this.color(str, 'gray', 'dim'),
        reset: (str: string) => this.color(str, 'reset', 'dim'),
    })
    static readonly ul = Object.freeze({
        red: (str: string) => this.color(str, 'red', 'underscore'),
        green: (str: string) => this.color(str, 'green', 'underscore'),
        yellow: (str: string) => this.color(str, 'yellow', 'underscore'),
        blue: (str: string) => this.color(str, 'blue', 'underscore'),
        magenta: (str: string) => this.color(str, 'magenta', 'underscore'),
        cyan: (str: string) => this.color(str, 'cyan', 'underscore'),
        white: (str: string) => this.color(str, 'white', 'underscore'),
        gray: (str: string) => this.color(str, 'gray', 'underscore'),
        reset: (str: string) => this.color(str, 'reset', 'underscore'),
    })

    constructor(text: string)
    constructor(text: string, key: ColorKey | null)
    constructor(text: string, key: ColorKey | null, mod: ColorMod | null)
    constructor(
        private text: string,
        private key: ColorKey | null = null,
        private mod: ColorMod | null = null
    ) {}

    toString() {
        const c = this.key != null ? codes[this.key] ?? '' : ''
        const m = this.mod != null ? codes[this.mod] ?? '' : ''
        return `${m}${c}${this.text}${codes.reset}`
    }

    color(): Color
    color(key: ColorKey | null): Color
    color(key: ColorKey | null, mod: ColorMod | null): Color
    color(key: ColorKey | null = null, mod: ColorMod | null = null) {
        this.key = key
        this.mod = mod != null ? mod : this.mod
        return this
    }

    get str() {
        return this.toString()
    }

    get bright() {
        return this.color(this.key, 'bright')
    }

    get br() {
        return this.bright
    }

    get dim() {
        return this.color(this.key, 'dim')
    }

    get dk() {
        return this.dim
    }

    get red() {
        return this.color('red')
    }

    get green() {
        return this.color('green')
    }

    get gray() {
        return this.color('gray')
    }
}
