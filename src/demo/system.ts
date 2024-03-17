import EventEmitter from 'events'
import { Disposer, IPanel, ISystem, WindowSize } from './types'
import { range } from '../iterator'
import { SystemPanel } from './sys-panel'
import { waitFps } from '../lib/time'

interface ResizeEvent {
    type: 'resize'
    data: WindowSize
}

interface TimerEvent {
    type: 'timer'
    data: number
}

type Event = ResizeEvent | TimerEvent

/**
 * Maps events to a union of their types.
 *
 * Interpretation
 *   - [K in keyof Event]: Event[K] crates a type where the proprties are unionized.
 *   - ['type'] pulls the type union off of the mapped type
 */
type EventType = { [K in keyof Event]: Event[K] }['type']

/**
 * Maps events to their data type for a given EventType
 *
 * Interpretaion:
 *   - [T in Event as T['type']] creates a union of events which can be discriminated based on type
 *   - :T['data'] maps these to the 'data' key union
 *   - [K] selects the one that matches T['type']
 */
type EventData<K extends EventType> = { [T in Event as T['type']]: T['data'] }[K]

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
    private timerIsRunning = false
    readonly error = (str: string) => void process.stderr.write(str + '\n')
    readonly write = (str: string) => void this.out.write(str)
    readonly writeln = (str?: string) => void this.out.write((str ?? '') + '\n')

    constructor(private readonly sysPanel: SystemPanel) {
        sysPanel.setSystem(this)
        this.init()
    }

    //
    // Track cursor x,y

    private init() {
        process.on('SIGINT', this.sigint)
        process.on('exit', this.exit)
    }

    private destroy() {
        process.off('SIGINT', this.sigint)
        process.off('exit', this.exit)
    }

    nextId(): number {
        return id.next
    }

    setMainPanel(panel: IPanel): void {
        this.sysPanel.setMainPanel(panel)
        this.sysPanel.setInterrupt(this.sigint)
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

    private readonly hideCursor = () => {
        return void process.stdout.write('\x1B[?25l')
    }

    private readonly showCursor = () => {
        return void process.stdout.write('\x1B[?25h')
    }

    get timerHasListeners() {
        return this.emitter.listenerCount('timer') > 0
    }

    private async createTimer(fps: number) {
        this.timerIsRunning = true
        let start = process.hrtime.bigint()

        while (true) {
            if (this.timerHasListeners) {
                console.log('timer is running:', this.timerIsRunning)
                const end = process.hrtime.bigint()
                await waitFps(fps)
                const elapsed = end - start
                this.emitter.emit('timer', Number(elapsed) / 1e6)
            } else {
                break
            }
        }
        return () => {}
    }

    addTimerListener(fn: (data: number) => void): Disposer {
        this.emitter.addListener('timer', fn)
        if (!this.timerIsRunning) {
            this.createTimer(60)
        }
        return () => {
            this.emitter.removeListener('timer', fn)

            if (!this.timerHasListeners) {
                this.timerIsRunning = false
            }
        }
    }

    private addEventListener<T extends EventType>(event: T, fn: (data: EventData<T>) => void): Disposer {
        this.emitter.addListener(event, fn)
        return () => this.emitter.removeListener(event, fn)
    }
}

export const sys = new System(new SystemPanel())
