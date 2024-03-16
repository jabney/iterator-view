import { Color } from '../lib/color'
import { IInsets, IPanel, IRect, ISystem, Insets, Rect, WindowSize } from './types'
import { fill, insetRect } from './util'

export class SystemPanel {
    private readonly id: number
    private rect: IRect = new Rect()
    private insets: IInsets = new Insets()
    private bg: Color = new Color()
    private panel: IPanel | null = null
    private sys: ISystem | null = null

    constructor() {
        this.id = 0
    }

    setSystem(sys: ISystem) {
        this.sys = sys
    }

    public onResize = (size: WindowSize): void => {
        // console.debug('sys panel window size:', size)
    }

    public onInput = (key: string) => {
        console.debug('sys panel keyboard input:', key.toString())
    }

    get initialized() {
        return this.sys != null && this.panel != null
    }

    get name(): string {
        return SystemPanel.name
    }

    get inner(): IRect {
        return insetRect(this.insets, this.rect)
    }

    get debugName() {
        return `${this.name}: ${this.id}`
    }

    render(): void {
        const insRect = insetRect(this.insets, this.rect)
        fill(this.bg, insRect)

        if (this.initialized) {
            this.panel?.render(insRect, this.bg)
        }
    }
}
