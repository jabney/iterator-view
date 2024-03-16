import EventEmitter from 'events'
import { Disposer, ICursor, IPanel, ISystem, WindowSize } from './types'
import { range } from '../iterator'
import { SystemPanel } from './sys-panel'

interface ResizeEvent {
    type: 'resize'
    data: WindowSize
}

interface SystemEvent {
    type: 'system'
    data: any
}

type Event = ResizeEvent | SystemEvent

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

    readonly error = (str: string) => process.stderr.write(str + '\n')
    readonly write = (str: string) => this.out.write(str)
    readonly writeln = (str?: string) => this.out.write((str ?? '') + '\n')

    constructor(private readonly sysPanel: SystemPanel) {
        sysPanel.setSystem(this)
        this.init()
    }

    //
    // Track cursor x,y

    private init() {
        process.on('SIGINT', this.sigint)
        process.on('exit', this.exit)
        process.stdout.on('resize', this.resize)

        this.sysPanel.onResize(this.getWindowSize())
    }

    private destroy() {
        process.off('SIGINT', this.sigint)
        process.off('exit', this.exit)
        process.stdout.off('resize', this.resize)
    }

    nextId(): number {
        return id.next
    }

    setMainPanel(panel: IPanel): void {
        this.sysPanel.setMainPanel(panel)
        this.sysPanel.setInterrupt(() => this.sigint)
    }

    start() {
        this.hideCursor()
        this.sysPanel.start()
    }

    private addEventListener<T extends EventType>(event: T, fn: (data: EventData<T>) => void): Disposer {
        this.emitter.addListener(event, fn)
        return () => this.emitter.removeListener(event, fn)
    }

    get cursor(): ICursor {
        return {
            // hide: this.hideCursor,
            // show: this.showCursor,
            cursorTo: this.cursorTo,
            moveCursor: this.moveCursor,
        }
    }

    createTimer(fps: number) {
        let delta = 0
        const [s, ns] = process.hrtime()
        return () => {}
    }

    private getWindowSize(): WindowSize {
        const [cols, lines] = process.stdout.getWindowSize()
        return { cols, lines }
    }

    private readonly resize = () => {
        this.sysPanel.onResize(this.getWindowSize())
    }

    private readonly exit = () => {
        this.destroy()
        this.sysPanel.exit()
        this.showCursor()
    }

    private readonly sigint = () => {
        this.exit()
        process.exit(0)
    }

    private readonly hideCursor = () => void process.stdout.write('\x1B[?25l')
    private readonly showCursor = () => void process.stdout.write('\x1B[?25h')

    private readonly cursorTo = (x: number, y: number) =>
        new Promise<void>(resolve => {
            this.out.cursorTo(x, y, () => resolve())
        })

    private readonly moveCursor = (dx: number, dy: number) =>
        new Promise<void>(resolve => {
            this.out.moveCursor(dx, dy, () => resolve())
        })
}

export const sys = new System(new SystemPanel())
