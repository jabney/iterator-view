import { clamp } from '../../lib/clamp'
import { Disposer } from '../../lib/disposer'
import { Insets } from '../panel/insets'
import { Rect } from '../panel/rect'
import { IPanel, WindowSize } from '../types'
import { ISystem } from './system'

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
    private readonly disposer = new Disposer()

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

        this.clear()
        this.render()
    }

    private readonly clear = () => {
        console.clear()
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
        this.disposer.add(
            sys.addInputListener(key => {
                console.log(key)
            })
        )
        const disposer = sys.addTimerListener(elapsed => {
            console.log(elapsed)
        })

        setTimeout(disposer, 5000)
    }

    setMainPanel(panel: IPanel) {
        this.panel = panel
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

    private render(): void {
        this.panel.render(this.rect)
    }
}
