import EventEmitter from 'events'
import { Disposer, IPanel } from '../types'
import { EventData, EventType } from './event'
import { range } from '../../iterator'
import { SystemPanel } from './system-panel'
import { waitFps } from '../../lib/time'

export interface ISystem {
    addInputListener(fn: (char: string) => void): Disposer
}

const code = {
    enter: '\x0d',
    space: '\x20',
    up: '\x1b\x5b\x41',
    down: '\x1b\x5b\x42',
    right: '\x1b\x5b\x43',
    left: '\x1b\x5b\x44',
}

const ctrl = {
    null: '\x00', // Null character
    a01: '\x01', // Start of Heading
    a02: '\x02', // Start of Text
    eot: '\x03', // End of Text (ctrl+c)
    a04: '\x04', // End of Transmission
    a05: '\x05', // Enquiry
    a06: '\x06', // Acknowledge
    bel: '\x07', // Bell, Alert
    a08: '\x08', // Backspace
    tab: '\x09', // Horizontal Tab
    lf: '\x0A', // Line Feed
    a0B: '\x0B', // Vertical Tabulation
    a0C: '\x0C', // Form Feed
    cr: '\x0D', // Carriage Return
    a0E: '\x0E', // Shift Out
    a0F: '\x0F', // Shift In
    a10: '\x10', // Data Link Escape
    a11: '\x11', // Device Control One (XON)
    a12: '\x12', // Device Control Two
    a13: '\x13', // Device Control Three (XOFF)
    a14: '\x14', // Device Control Four
    a15: '\x15', // Negative Acknowledge
    a16: '\x16', // Synchronous Idle
    a17: '\x17', // End of Transmission Block
    a18: '\x18', // Cancel
    a19: '\x19', // End of medium
    a1A: '\x1A', // Substitute
    esc: '\x1B', // Escape
    a1C: '\x1C', // File Separator
    a1D: '\x1D', // Group Separator
    a1E: '\x1E', // Record Separator
    a1F: '\x1F', // Unit Separator
    space: '\x20', // Space
    del: '\x7F', // Delete
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
    private input: ReturnType<typeof InputManager>

    readonly error = (str: string) => void process.stderr.write(str + '\n')
    readonly write = (str: string) => void this.out.write(str)
    readonly writeln = (str?: string) => void this.out.write((str ?? '') + '\n')
    private timerIsRunning = false

    constructor(private readonly sysPanel: SystemPanel) {
        this.input = InputManager(this.sigint)
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

    readonly addInputListener = (fn: (char: string) => void): Disposer => {
        return this.input.addListener(fn)
    }

    addEventListener<T extends EventType>(event: T, fn: (data: EventData<T>) => void): Disposer {
        this.emitter.addListener(event, fn)

        switch (event) {
            case 'timer':
                this.onTimerListener('add')
                break
            case 'keyboard':
                break
        }
        return () => {
            this.emitter.removeListener(event, fn)

            switch (event) {
                case 'timer':
                    this.onTimerListener('remove')
                    break
                case 'keyboard':
                    break
            }
        }
    }

    private onTimerListener(type: 'add' | 'remove') {
        if (type === 'add') {
            if (!this.timerIsRunning) {
                this.createTimer()
            }
        } else {
            if (!this.timerHasListeners) {
                this.timerIsRunning = false
            }
        }
    }

    private async createTimer() {
        this.timerIsRunning = true
        let start = process.hrtime.bigint()

        while (true) {
            if (this.timerHasListeners) {
                const end = process.hrtime.bigint()
                await waitFps(60)
                const elapsed = end - start
                this.emitter.emit('timer', Number(elapsed) / 1e6) // to ms
            } else {
                break
            }
        }
    }
}

export const sys = new System(new SystemPanel())

/**
 *
 */
function InputManager(interrupt: () => void) {
    const emitter = new EventEmitter()
    const name = 'input'
    let running = false

    async function start() {
        const rawMode = process.stdin.isRaw
        process.stdin.setRawMode(true)
        running = true
        while (readInput()) {
            if (!running) break
            await waitFps(30)
        }
        process.stdin.setRawMode(rawMode)
    }

    function readInput(): boolean {
        const data: Buffer = process.stdin.read()
        if (data != null) {
            const str = data.toString()
            if (str === ctrl.eot) {
                interrupt()
                return false
            }
            emitter.emit(name, str)
        }
        return true
    }

    return {
        addListener(fn: (char: string) => void): Disposer {
            emitter.addListener(name, fn)

            if (!running) start()

            return () => {
                emitter.removeListener(name, fn)
                if (emitter.listenerCount(name) === 0) {
                    running = false
                }
            }
        },

        stop() {
            running = false
        },

        destroy() {
            this.stop()
            emitter.removeAllListeners(name)
        },
    }
}
