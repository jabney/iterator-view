import { clamp } from '../lib/clamp'
import { IPanel, ISystem, Insets, Rect, WindowSize } from './types'

const createPanel = () => ({
    rect: new Rect(),
    insets: new Insets(),
    resize: () => void 0,
    render: () => void 0,
    destroy: () => void 0,
})

const aspect = 0.3
const wMin = 80
const wMax = 120

export class SystemPanel {
    private readonly id: number
    private sys: ISystem | null = null
    private rect: Rect = new Rect()
    private panel: IPanel = createPanel()

    private bounds = {
        w: { min: wMin, max: wMax },
        h: { min: aspect * wMin, max: aspect * wMax },
    }

    constructor() {
        this.id = 0
    }

    start() {
        this.rect = this.createRect(this.getWindowSize())

        if (!this.initialized) {
            throw new Error('<SystemPanel> not initialized')
        }

        process.stdout.on('resize', this.resize)
        // this.readInput()

        console.clear()
        this.render()
    }

    private destroy() {
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
        sys.addInputListener(str => {
            // console.log('input listener:', char)
        })
    }

    setMainPanel(panel: IPanel) {
        this.panel = panel
    }

    exit() {
        this.destroy()
        console.clear()
    }

    private createRect(size: WindowSize) {
        const width = clamp(this.bounds.w.min, this.bounds.w.max, size.cols)
        const height = clamp(this.bounds.h.min, this.bounds.h.max, size.lines)
        return new Rect(width, height)
    }

    private readonly resize = (): void => {
        this.rect = this.createRect(this.getWindowSize())
        console.clear()
        this.render()
    }

    private getWindowSize(): WindowSize {
        const [cols, lines] = process.stdout.getWindowSize()
        return { cols, lines }
    }

    private render(): void {
        this.panel.render(this.rect)
    }
}
