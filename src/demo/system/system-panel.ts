import { clamp } from '../../lib/clamp'
import { Disposer } from '../../lib/disposer'
import { Rect } from './rect'
import { IPanel, WindowSize } from '../types'
import { Context } from './context'
import { FrameBuffer } from './frame-buffer'
import { ISystem, PanelConfig } from './system'

const createPanel = (): IPanel => ({
    render: () => {},
    destroy: () => {},
})

const aspect = 0.3
const wMin = 40
const wMax = 120

export class SystemPanel {
    private readonly id: number
    private buf: FrameBuffer = new FrameBuffer(new Rect())
    private cfg: PanelConfig | null = null
    private readonly disposer = new Disposer()

    private bounds = {
        w: { min: wMin, max: wMax },
        h: { min: aspect * wMin, max: aspect * wMax },
    }

    constructor(private readonly sys: ISystem) {
        this.id = 0
    }

    private get rect() {
        return this.buf.rect
    }

    private get bg() {
        return this.cfg?.bg ?? null
    }

    private get tc() {
        return this.cfg?.tc ?? null
    }

    private get panel() {
        return this.cfg?.panel ?? createPanel()
    }

    start() {
        this.buf = this.createBuffer()

        if (!this.initialized) {
            throw new Error('<SystemPanel> not initialized')
        }
        process.stdout.on('resize', this.resize)

        this.render()
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

    setConfig(cfg: PanelConfig) {
        this.cfg = cfg
    }

    exit() {
        this.destroy()
    }

    private createBuffer() {
        const size = this.getWindowSize()
        const width = clamp(this.bounds.w.min, this.bounds.w.max, size.cols)
        const height = clamp(this.bounds.h.min, this.bounds.h.max, size.lines)
        return new FrameBuffer(new Rect(width, height))
    }

    private readonly resize = (): void => {
        this.buf = this.createBuffer()
        this.render()
    }

    private getWindowSize(): WindowSize {
        const [cols, lines] = process.stdout.getWindowSize()
        return { cols, lines }
    }

    render = (): void => {
        this.sys.clearScreen()
        this.panel.render(new Context(this.buf, this.rect, this.bg, this.tc))
        this.buf.present()
    }
}
