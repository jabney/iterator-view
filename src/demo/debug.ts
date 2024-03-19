import { count } from '../iterator'
import { Color } from '../lib/color'
import { Insets, Panel, Rect, TextPanel } from './panel'
import { runScript, waitSeconds } from './demo-utils'
import { sys } from './system/system'
import { applyColor, fill, insetRect } from './util'
import { UICheckItem, UICheckPanel } from './panel/ui-panel'

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

    const ui = new UICheckPanel(options, insets)
    insetPanel.add(ui)

    sys.start()
}

async function debug() {
    const script = [
        // async () => await RectTest(),
        //
        // async () => await PanelTest(),
        //
        async () => await UITest(),
        //
        async () => await waitSeconds(999),
    ]

    await runScript(script)
    sys.end()
}

debug()
