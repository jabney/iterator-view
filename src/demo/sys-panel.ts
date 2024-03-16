import { clamp } from '../lib/clamp'
import { waitFps } from '../lib/time'
import { IPanel, ISystem, Insets, Rect, WindowSize } from './types'

const createPanel = () => ({
    rect: new Rect(),
    insets: new Insets(),
    resize: () => void 0,
    render: () => void 0,
    destroy: () => void 0,
})

const ctrl = {
    // control+c
    eot: '\x03',
}

const aspect = 0.3
const wMin = 80
const wMax = 100

export class SystemPanel {
    private readonly id: number
    private sys: ISystem | null = null
    private rect: Rect = new Rect()
    private panel: IPanel = createPanel()
    private interrupt = (): void => void 0
    private haltInput = false

    private bounds = {
        w: { min: wMin, max: wMax },
        h: { min: aspect * wMin, max: aspect * wMax },
    }

    constructor() {
        this.id = 0
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

    private get running() {
        return this.haltInput === false
    }

    setSystem(sys: ISystem) {
        this.sys = sys
    }

    setMainPanel(panel: IPanel) {
        this.panel = panel
    }

    setInterrupt(fn: () => void) {
        this.interrupt = fn
    }

    start() {
        if (this.initialized) {
            console.clear()
            this.readInput()
            this.render()
        } else {
            throw new Error('<SystemPanel> not initialized')
        }
    }

    exit() {
        this.haltInput = true
        this.destroy()
        console.clear()
    }

    onResize = (size: WindowSize): void => {
        const width = clamp(this.bounds.w.min, this.bounds.w.max, size.cols)
        const height = clamp(this.bounds.h.min, this.bounds.h.max, size.lines)
        this.rect = new Rect(width, height)

        console.clear()
        this.render()
        // console.log(size)
    }

    onInput = (key: string) => {
        console.debug('sys panel keyboard input:', key.toString())
    }

    private destroy() {
        this.panel.destroy()
    }

    private async readInput() {
        const rawMode = process.stdin.isRaw
        process.stdin.setRawMode(true)

        while (this.running && this.handleInput()) {
            await waitFps(15)
        }
        this.haltInput = false
        process.stdin.setRawMode(rawMode)
    }

    private handleInput(): boolean {
        const data = process.stdin.read()
        if (data != null) {
            const [char] = data.toString()
            if (char === ctrl.eot) {
                this.interrupt()
                return false
            }
            this.onInput(char)
        }
        return true
    }

    render(): void {
        this.panel.render(this.rect)
    }
}
