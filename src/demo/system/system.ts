import EventEmitter from 'events'
import { DisposeFn, IPanel } from '../types'
import { range } from '../../iterator'
import { SystemPanel } from './system-panel'
import { IInputManager, InputManager } from './input-manager'
import { TimerManager, ITimerManager } from './timer-manager'
import { EventData, EventType } from './event'

export interface ISystem {
    addInputListener(fn: (char: string) => void): DisposeFn
    addTimerListener(fn: (elapsed: number) => void): DisposeFn
}

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
    private input: IInputManager
    private timer: ITimerManager

    readonly error = (str: string) => void process.stderr.write(str + '\n')
    readonly write = (str: string) => void this.out.write(str)
    readonly writeln = (str?: string) => void this.out.write((str ?? '') + '\n')

    constructor(private readonly sysPanel: SystemPanel) {
        this.input = InputManager(this.sigint)
        this.timer = TimerManager()
        this.init()
    }

    private init() {
        this.sysPanel.setSystem(this)
        process.on('SIGINT', this.sigint)
        process.on('exit', this.exit)
    }

    private destroy() {
        this.input.destroy()
        process.off('SIGINT', this.sigint)
        process.off('exit', this.exit)
    }

    nextId(): number {
        return id.next
    }

    setMainPanel(panel: IPanel): void {
        this.sysPanel.setMainPanel(panel)
    }

    start() {
        this.hideCursor()
        this.sysPanel.start()
    }

    end() {
        this.exit()
    }

    private readonly exit = () => {
        this.sysPanel.exit()
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

    readonly addInputListener = (fn: (char: string) => void): DisposeFn => {
        return this.input.addListener(fn)
    }

    readonly addTimerListener = (fn: (elapsed: number) => void): DisposeFn => {
        return this.timer.addListener(fn)
    }

    private addEventListener<T extends EventType>(event: T, fn: (data: EventData<T>) => void): DisposeFn {
        return () => {}
    }
}

export const sys = new System(new SystemPanel())
