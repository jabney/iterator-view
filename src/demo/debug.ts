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
    // const fill = new Pixel(new Char(' '), SColor.bit8(224, 0, 224))
    //
    const bg = SColor.bit8(229, 0, 0)
    const fg = SColor.bit8(229, 229, 229)
    const surface = new Surface(80, 30)

    const pix = strToPix(' Jimmy ', bg, fg)
    surface.write(pix, 10, 20)
    // console.log(surface)
    surface.render(SColor.bit24(128, 0, 220))

    //
    //
    // const scale = Scale.domain([0, 255]).range([0, 5], Math.round)
    // console.log(scale(229))
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
        async () => await SurfaceTest(),
        //
        async () => await waitSeconds(999),
    ]

    await runScript(script)
    sys.end()
}

debug()
