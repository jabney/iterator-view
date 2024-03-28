/**
 *
 */

import EventEmitter from 'events'
import { IResizable } from './resizable'
import { DisposeFn } from './types'
import { EventData, EventType } from './event'

export type WindowSize = { cols: number; lines: number }

const cursor = {
    show: '\x1B[?25h',
    hide: '\x1B[?25l',
}

export class Host {
    static create(width: number, height: number, obj: IResizable) {
        return new Host(width, height, obj)
    }

    private readonly emitter = new EventEmitter()
    private readonly out = process.stdout

    constructor(
        private width: number,
        private height: number,
        private readonly obj: IResizable
    ) {
        this.init()
    }

    private init() {
        this.out.on('resize', this.resize)
        process.on('SIGINT', this.exit)
        process.on('exit', this.exit)

        console.clear()
        this.out.write(cursor.hide)
        this.resize()
    }

    private destroy() {
        this.out.off('resize', this.resize)
        process.off('SIGINT', this.exit)
        process.off('exit', this.exit)
    }

    addEventListener<T extends EventType>(event: T, fn: (data: EventData<T>) => void): DisposeFn {
        this.emitter.addListener(event, fn)
        return () => this.emitter.removeListener(event, fn)
    }

    private readonly exit = () => {
        this.out.cursorTo(0, 0)
        this.out.clearScreenDown()
        this.out.write(cursor.show)
        this.emitter.emit('exit')
        this.destroy()
    }

    private readonly resize = (): void => {
        const { cols, lines } = getWindowSize()
        this.obj.resize(Math.min(this.width, cols), Math.min(this.height, lines))
    }
}

function getWindowSize(): WindowSize {
    const [cols, lines] = process.stdout.getWindowSize()
    return { cols, lines }
}
