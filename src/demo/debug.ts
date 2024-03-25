import { count } from '../iterator'
import { Color } from '../lib/color'
import { Panel, TextPanel } from './panel'
import { runScript, waitSeconds } from './demo-utils'
import { sys } from './system/system'
import { applyColor, fill, insetRect } from './util'
import { UICheckItem, UICheckPanel } from './panel/ui-panel'
import { FrameBuffer } from './system/frame-buffer'
import { Rect } from './system/rect'
import { Insets } from './system/insets'
import { Surface } from './system/surface/surface'
import { Pixel } from './system/pixel'
import { Char } from './system/char'
import { Color as SColor } from './system/color'
import { Nullable } from './types'

const out = process.stdout

async function RectTest() {
    const rect = new Rect(30, 15)
    {
        const c = Color.bgWhite()
        fill(c, rect)

        for (const row of count(rect.height)) {
            const text = c.text(' '.repeat(rect.width))
            out.cursorTo(rect.x, rect.y + row)
            out.write(text.str + '\n')
        }
    }

    {
        const insets = new Insets(1, 2, 1, 2)
        const insRect = insetRect(insets, rect)
        const c = Color.bgMagenta()

        fill(c, insRect)

        for (const row of count(insRect.height)) {
            const text = c.text(' '.repeat(insRect.width))
            out.cursorTo(insRect.x, insRect.y + row)
            out.write(text.str + '\n')
        }
    }
}

async function PanelTest() {
    const main = new Panel(new Insets(), Color.bgWhite())

    const bg = Color.bgBlue()

    const inner = new Panel(new Insets(1, 2, 1, 2), bg)
    main.add(inner)

    const lines = ['This is a TextPanel', 'This is subtext']
    const colors = applyColor(Color.white(), lines)
    const text = new TextPanel(colors, new Insets(1, 2, 1, 2), null, { h: 'center', v: 'middle' })
    inner.add(text)

    sys.setMainPanel(main)
    sys.start()
}

async function UITest() {
    const insets = new Insets(1, 2, 1, 2)

    const options: UICheckItem[] = [
        {
            text: Color.white('Option 1'),
            default: true,
        },
        {
            text: Color.white('Option 2'),
        },
        {
            text: Color.white('Option 3'),
            default: true,
        },
        {
            text: Color.white('Option 4'),
        },
    ]

    const main = new Panel(insets, Color.bgWhite())
    sys.setMainPanel(main)

    const insetPanel = new Panel(insets, Color.bgBlue())
    main.add(insetPanel)

    const ui = new UICheckPanel(options, insets /* , Color.bgBlue() */)
    insetPanel.add(ui)

    sys.start()
}

async function FrameBufferTest() {
    const buf = new FrameBuffer(80, 20)
    buf.fill(Color.bgMagenta(), new Rect(80, 20))
    buf.fill(Color.bgBlue(), new Rect(20, 10, 4, 2))
    buf.write(0, 5, Color.white('Jimmy was here'))
    buf.present()
}

const reset = '\x1b[0m'

function strToPix(str: string, bg?: Nullable<SColor>, fg?: Nullable<SColor>): Pixel[] {
    const pixels: Pixel[] = []
    for (const c of str) {
        pixels.push(new Pixel(new Char(c), bg, fg))
    }
    return pixels
}

function strToPixStr(str: string, bg?: Nullable<SColor>, fg?: Nullable<SColor>) {
    return strToPix(str, bg, fg).join('') + '\x1b[0m'
}

async function SurfaceTest() {
    const width = 2 * 60
    const height = 40
    const surface = new Surface(width, height, SColor.bit24(0, 152, 64))
    /**
     *
     */
    const debugInfo = () => {
        const debugFill = SColor.bit24(32, 0, 64)
        let lastMs = 0

        return (ms: number) => {
            const delta = ms - lastMs
            const fps = 1000 / delta
            lastMs = ms

            const fpsText = fps.toFixed(1) + ' fps '
            const fpsBox = fpsText.padStart(12, ' ')
            const info = strToPix(fpsBox, debugFill)
            surface.write(info, 2, 1)
        }
    }
    /**
     *
     */
    const animText = () => {
        const text = `Jimmy`
        const pos = { x: width / 2 - text.length / 2, y: height / 2 }
        const fg = SColor.bit24(220, 220, 220)
        const bg = SColor.bit24(50, 0, 50)
        const pixels = strToPix(` Jimmy `, bg, fg)
        const [amp, time] = [15, 0.005]

        return (elapsed: number) => {
            const x = pos.x + Math.round(0.5 * amp * Math.cos(3 * time * elapsed))
            const y = pos.y + Math.round(amp * Math.sin(time * elapsed))
            surface.write(pixels, x, y)
        }
    }
    /**
     *
     */
    function run() {
        sys.hideCursor()

        console.clear()
        const fill = SColor.bit24(160, 0, 220)
        surface.fill()
        const drawDebug = debugInfo()
        const drawAnim = animText()

        sys.addTimerListener(elapsed => {
            // surface.clear()
            surface.clearFrame()

            drawDebug(elapsed)
            drawAnim(elapsed)

            // surface.render(fill)
            surface.renderFrame()
        })
    }
    run()
}

async function SurfaceAnim() {
    const width = 2 * 60
    const height = 40
    /**
     *
     */
    const debugInfo = (surface: Surface) => {
        const debugFill = SColor.bit24(32, 0, 64)
        let lastMs = 0

        return (ms: number) => {
            const delta = ms - lastMs
            const fps = 1000 / delta
            lastMs = ms

            const fpsText = fps.toFixed(1) + ' fps '
            const fpsBox = fpsText.padStart(12, ' ')
            const info = strToPix(fpsBox, debugFill)
            surface.write(info, 2, 1)
        }
    }

    /**
     *
     */
    class Entity {
        rand = Math.random()
        x = width / 2 - 1 + (this.rand < 0.5 ? -5 : 5)
        y = height / 2 + (this.rand < 0.5 ? -5 : 5)
        bgc = SColor.bit24(255 * Math.random(), 255 * Math.random(), 255 * Math.random())
        pixels: Pixel[]
        amp = 10 + 10 * Math.random()
        time = 0.02 + 0.02 * Math.random()

        constructor(private readonly sfc: Surface) {
            const p = Pixel.from(this.bgc)
            this.pixels = [p, p]
        }

        render(elapsed: number) {
            elapsed = elapsed / 10
            const x = this.x + 2 * this.amp * Math.cos(this.time * elapsed)
            const y = this.y + this.amp * Math.sin(this.time * elapsed)
            this.sfc.write(this.pixels, x, y)
            this.sfc.write(this.pixels, x, y)
        }
    }

    /**
     *
     */
    async function run() {
        sys.hideCursor()
        // const bgc = SColor.bit24(0, 152, 64)
        const bgc = SColor.bit24(0, 100, 50)

        const surface = new Surface(width, height, bgc)

        console.clear()
        surface.fill()
        const drawDebug = debugInfo(surface)
        const entities: Entity[] = []

        for (let i = 0; i < 50; i++) {
            entities.push(new Entity(surface))
        }

        sys.addTimerListener(elapsed => {
            surface.clearFrame()
            drawDebug(elapsed)
            entities.forEach(x => x.render(elapsed))
            surface.renderFrame()
        })
    }
    run()
}

async function debug() {
    const script = [
        // async () => await RectTest(),
        //
        // async () => await PanelTest(),
        //
        // async () => await UITest(),
        //
        // async () => await FrameBufferTest(),
        //
        // async () => await SurfaceTest(),
        //
        async () => await SurfaceAnim(),
        //
        async () => await waitSeconds(999),
    ]

    await runScript(script)
    sys.end()
}

debug()
