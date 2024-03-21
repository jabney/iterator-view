import EventEmitter from 'events'
import { DisposeFn, IPanel, KeyType, Nullable } from '../types'
import { range } from '../../iterator'
import { SystemPanel } from './system-panel'
import { IInputManager, InputManager } from './input-manager'
import { TimerManager, ITimerManager } from './timer-manager'
import { EventData, EventType } from './event'
import { Color } from '../../lib/color'

export interface ISystem extends System {}

export type PanelConfig = Pick<UiConfig, 'bg' | 'tc' | 'panel'>
export type IUiConfig = Pick<UiConfig, 'background' | 'text'>

class UiConfig {
    bg: Nullable<Color>
    tc: Nullable<Color>

    constructor(readonly panel: IPanel) {}

    background = (bg: Color) => {
        this.bg = bg
        return createConfig(this)
    }

    text = (color: Color) => {
        this.tc = color
        return createConfig(this)
    }
}

const createConfig = (cfg: UiConfig): IUiConfig => ({
    background: cfg.background,
    text: cfg.text,
})

const id = (() => {
    const counter = range(1, Infinity)
    return {
        get next(): number {
            return counter.next().value
        },
    }
})()

class System implements ISystem {
    private readonly emitter = new EventEmitter()
    private readonly out = process.stdout
    private panel: SystemPanel
    private input: IInputManager
    private timer: ITimerManager
    private cfg: UiConfig | null = null

    readonly error = (str: string) => void process.stderr.write(str + '\n')
    readonly write = (str: string) => void this.out.write(str)
    readonly writeln = (str?: string) => void this.out.write((str ?? '') + '\n')

    constructor() {
        this.panel = new SystemPanel(this)
        this.input = InputManager(this.sigint)
        this.timer = TimerManager()
        this.init()
    }

    get bg(): Color | null {
        return this.cfg?.bg ?? null
    }

    private init() {
        process.on('SIGINT', this.sigint)
        process.on('exit', this.exit)
    }

    private destroy() {
        this.input.destroy()
        this.timer.destroy()
        process.off('SIGINT', this.sigint)
        process.off('exit', this.exit)
    }

    nextId(): number {
        return id.next
    }

    setMainPanel(panel: IPanel): IUiConfig {
        this.cfg = new UiConfig(panel)
        this.panel.setConfig(this.cfg)
        return createConfig(this.cfg)
    }

    start() {
        this.hideCursor()
        this.panel.start()
    }

    end() {
        this.exit()
    }

    redraw() {
        this.panel.render()
    }

    private readonly exit = () => {
        this.panel.exit()
        this.destroy()
        this.showCursor()
        process.exit(0)
    }

    private readonly sigint = () => {
        this.exit()
    }

    readonly cursorTo = (x: number, y: number): void => {
        return void this.out.cursorTo(x, y)
    }

    readonly moveCursor = (dx: number, dy: number) => {
        return void this.out.moveCursor(dx, dy)
    }

    readonly hideCursor = () => {
        return void process.stdout.write('\x1B[?25l')
    }

    readonly showCursor = () => {
        return void process.stdout.write('\x1B[?25h')
    }

    get timerHasListeners() {
        return this.emitter.listenerCount('timer') > 0
    }

    get inputHasListeners() {
        return this.emitter.listenerCount('keyboard') > 0
    }

    readonly addInputListener = (fn: (key: KeyType) => void): DisposeFn => {
        return this.input.addListener(fn)
    }

    readonly addTimerListener = (fn: (elapsed: number) => void): DisposeFn => {
        return this.timer.addListener(fn)
    }

    private addEventListener<T extends EventType>(event: T, fn: (data: EventData<T>) => void): DisposeFn {
        return () => {}
    }
}

export const sys = new System()
