import EventEmitter from 'events'
import { Disposer, EventData, EventType, IPanel, ISystem } from './types'
import { range } from '../iterator'
import { SystemPanel } from './sys-panel'
import { waitFps } from '../lib/time'

const ctrl = {
    eot: '\x03', // control+c
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
    private timerIsRunning = false
    readonly error = (str: string) => void process.stderr.write(str + '\n')
    readonly write = (str: string) => void this.out.write(str)
    readonly writeln = (str?: string) => void this.out.write((str ?? '') + '\n')
    private destroyed = false

    constructor(private readonly sysPanel: SystemPanel) {
        this.init()
    }

    private init() {
        this.sysPanel.setSystem(this)
        process.on('SIGINT', this.sigint)
        process.on('exit', this.exit)
    }

    private destroy() {
        process.off('SIGINT', this.sigint)
        process.off('exit', this.exit)
        this.destroyed = true
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

    private async createInput() {
        const rawMode = process.stdin.isRaw
        process.stdin.setRawMode(true)

        while (this.readInput()) {
            if (this.destroyed) break
            await waitFps(30)
        }
        process.stdin.setRawMode(rawMode)
    }

    private readInput(): boolean {
        const data = process.stdin.read()
        if (data != null) {
            const [char] = data.toString()
            if (char === ctrl.eot) {
                this.sigint()
                return false
            }
            this.emitter.emit('keyboard', char)
        }
        return true
    }
}

export const sys = new System(new SystemPanel())
