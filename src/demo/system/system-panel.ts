import { clamp } from '../../lib/clamp'
import { Disposer } from '../../lib/disposer'
import { Rect } from '../panel/rect'
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
    private rect: Rect = new Rect()
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
        this.buf = new FrameBuffer(this.rect)
        this.clear()
        this.render()
    }

    private getWindowSize(): WindowSize {
        const [cols, lines] = process.stdout.getWindowSize()
        return { cols, lines }
    }

    render(): void {
        this.panel.render(new Context(this.buf, this.rect, this.bg))
    }
}
