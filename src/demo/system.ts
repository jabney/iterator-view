import EventEmitter from 'events'
import { IObservable, Observable, Subject } from '../lib/observable'
import { Disposer } from './types'

export type WindowSize = { cols: number; lines: number }

export interface ICursor {
    readonly hide: () => void
    readonly show: () => void
    readonly cursorTo: (x: number, y: number) => void
    readonly moveCursor: (dx: number, dy: number) => void
}

export interface ISystem {
    readonly windowSize: WindowSize
    readonly resize$: IObservable<WindowSize>
    readonly cursor: ICursor
}

export type Event = 'jimmy' | 'also-jimmy'

export class System implements ISystem {
    private _windowSize: WindowSize
    private readonly resizeSubject$: Subject<WindowSize>
    private readonly timerSubject$: Subject<number>
    private readonly emitter = new EventEmitter()
    private readonly out = process.stdout

    readonly error = (str: string) => process.stderr.write(str + '\n')
    readonly write = (str: string) => this.out.write(str)
    readonly writeln = (str: string) => this.out.write(str + '\n')

    constructor() {
        this._windowSize = this.getWindowSize()

        this.resizeSubject$ = this.createResizeSubject()
        this.timerSubject$ = this.createTimerSubject()

        this.init()
    }

    private init() {
        process.on('SIGINT', this.sigint)
        return this.dispose
    }

    private readonly dispose = () => {
        process.off('SIGINT', this.sigint)
    }

    addEventListener(event: Event, fn: () => void): Disposer {
        this.emitter.addListener(event, fn)
        return () => this.emitter.removeListener(event, fn)
    }

    get windowSize() {
        return this._windowSize
    }

    get resize$(): IObservable<WindowSize> {
        return this.resizeSubject$.asObservable()
    }

    get timer$(): IObservable<number> {
        return this.timerSubject$.asObservable()
    }

    get cursor(): ICursor {
        return { hide: this.hideCursor, show: this.showCursor, cursorTo: this.cursorTo, moveCursor: this.moveCursor }
    }

    private createResizeSubject() {
        const subject = new Subject<{ cols: number; lines: number }>()
        subject.next(this.getWindowSize())
        process.stdout.on('resize', () => void subject.next(this.getWindowSize()))
        return subject
    }

    private createTimerSubject() {
        const subject = new Subject<number>()

        process.stdout.on('resize', () => void subject.next(0))
        return subject
    }

    private getWindowSize(): WindowSize {
        const [cols, lines] = process.stdout.getWindowSize()
        return { cols, lines }
    }

    private readonly sigint = () => {
        this.showCursor()
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
