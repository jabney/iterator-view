export interface IController<T = unknown> {
    halt: boolean
    pause: boolean
    data: T
}

export class Controller<T extends { [key: string]: unknown } = {}> implements IController<T> {
    private readonly state: T | null

    constructor()
    constructor(
        public halt = false,
        public pause = false,
        private _data: T | null = null
    ) {
        this.state = JSON.parse(JSON.stringify(_data))
    }

    get data(): T {
        return this._data ?? ({} as T)
    }

    set(key: keyof T, value: T[typeof key]): this {
        this.data[key] = value
        return this
    }

    reset() {
        this.halt = false
        this.pause = false
        this._data = this.state
    }
}
