import { clamp } from '../lib/clamp'
import { IPanel, ISystem, Insets, Rect, WindowSize } from './types'

const createPanel = () => ({
    rect: new Rect(),
    insets: new Insets(),
    resize: () => void 0,
    render: () => void 0,
})

const aspect = 0.3
const wMin = 60
const wMax = 80

export class SystemPanel {
    private readonly id: number
    private rect: Rect = new Rect()
    private panel: IPanel = createPanel()
    private sys: ISystem | null = null
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

    setSystem(sys: ISystem) {
        this.sys = sys
    }

    setMainPanel(panel: IPanel) {
        this.panel = panel
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
        console.clear()
    }

    onResize = (size: WindowSize): void => {
        const width = clamp(this.bounds.w.min, this.bounds.w.max, size.cols)
        const height = clamp(this.bounds.h.min, this.bounds.h.max, size.lines)
        this.rect = new Rect(width, height)

        console.clear()
        this.render()
    }

    onInput = (key: string) => {
        // console.debug('sys panel keyboard input:', key.toString())
    }

    private async readInput() {
        // const stdin = process.stdin
        // stdin.setRawMode(true)
        // while (true) {
        //     const data = stdin.read()
        //     if (data != null) {
        //         const [char] = data.toString()
        //         console.log('read input:', data)
        //         if (char === 'e' || char === '\x03') break
        //     }
        // await waitMs(fpsMs(15))
        // }
    }

    render(): void {
        this.panel.render(this.rect)
    }
}
