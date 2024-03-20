import { count } from '../../iterator'
import { clamp } from '../../lib/clamp'
import { Color } from '../../lib/color'
import { Disposer } from '../../lib/disposer'
import { Rect } from '../panel/rect'
import { IPanel, IRect, WindowSize } from '../types'
import { ISystem, PanelConfig } from './system'

const createPanel = (): IPanel => ({
    render: () => {},
    destroy: () => {},
})

const aspect = 0.3
const wMin = 40
const wMax = 120

type Frame = Color[][]

export class FrameBuffer {
    private frame: Frame = []

    constructor(private readonly rect: IRect) {
        const line = ' '.repeat(rect.width)
        for (const _ of count(rect.height)) {
            this.frame.push(this.stringToPixels(line))
        }
    }

    private stringToPixels(line: string) {
        return [...line].map(x => new Color(x))
    }

    write(x: number, y: number, text: Color) {
        if (x > this.rect.width || y > this.rect.height) {
            throw new Error(`<FrameBuffer.write> coordinates overflow for x=${x}, y=${y}`)
        }
        const str = text.raw

        if (str == null) {
            throw new Error(`<FrameBuffer.write> text object has null string`)
        }
        if (x + str.length > this.rect.width) {
            throw new Error(`<FrameBuffer.write> text overflows buffer line`)
        }
        const row = this.frame[y]
        const [start, end] = [x, x + str.length]

        if (text.hasBg) {
            const bg = text.bg
            for (let i = start; i < end; i++) {
                row[i] = bg.text(str[i - x])
            }
        } else {
            for (let i = start; i < end; i++) {
                const c = row[i]
                row[i] = c.bg.text(str[i - x])
            }
        }
    }

    fill(color: Color) {
        const bg = color.bg
        for (const row of count(this.rect.height)) {
            for (const col of count(this.rect.width)) {
                this.frame[row][col] = bg.text(' ')
            }
        }
    }

    present() {
        const out = process.stdout
        for (const row of this.frame) {
            const line = row.map(x => x.str).join('')
            out.write(`${line}\n`)
        }
    }
}

export class SystemPanel {
    private readonly id: number
    private sys: ISystem | null = null
    private rect: Rect = new Rect()

    private cfg: PanelConfig | null = null
    private readonly disposer = new Disposer()

    private bounds = {
        w: { min: wMin, max: wMax },
        h: { min: aspect * wMin, max: aspect * wMax },
    }

    constructor() {
        this.id = 0
    }

    get bg() {
        return this.cfg?.bg ?? null
    }

    get tc() {
        return this.cfg?.tc ?? null
    }

    get panel() {
        return this.cfg?.panel ?? createPanel()
    }

    start() {
        this.rect = this.createRect(this.getWindowSize())

        if (!this.initialized) {
            throw new Error('<SystemPanel> not initialized')
        }

        process.stdout.on('resize', this.resize)

        this.clear()
        this.render()
    }

    private readonly clear = () => {
        console.clear()
    }

    destroy() {
        process.stdout.off('resize', this.resize)
        this.panel.destroy()
    }

    get initialized() {
        return this.sys != null && !this.rect.empty()
    }

    get name(): string {
        return SystemPanel.name
    }

    get debugName() {
        return `${this.name}: ${this.id}`
    }

    setSystem(sys: ISystem) {
        this.sys = sys
    }

    setMainPanel(cfg: PanelConfig) {
        this.cfg = cfg
    }

    exit() {
        this.destroy()
        this.clear()
    }

    private createRect(size: WindowSize) {
        const width = clamp(this.bounds.w.min, this.bounds.w.max, size.cols)
        const height = clamp(this.bounds.h.min, this.bounds.h.max, size.lines)
        return new Rect(width, height)
    }

    private readonly resize = (): void => {
        this.rect = this.createRect(this.getWindowSize())
        this.clear()
        this.render()
    }

    private getWindowSize(): WindowSize {
        const [cols, lines] = process.stdout.getWindowSize()
        return { cols, lines }
    }

    render(): void {
        this.panel.render({ rect: this.rect, bg: this.bg })
    }
}
