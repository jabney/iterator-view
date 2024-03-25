import { Color } from '../../lib/color'
import { Panel, TextPanel } from '../panel'
import { sys } from '../system/system'
import { applyColor } from '../util'
import { UICheckItem, UICheckPanel } from '../panel/ui-panel'
import { FrameBuffer } from '../system/frame-buffer'
import { Rect } from '../system/rect'
import { Insets } from '../system/insets'

/**
 *
 */
export async function PanelTest() {
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

/**
 *
 */
export async function UITest() {
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

/**
 *
 */
export async function FrameBufferTest() {
    const buf = new FrameBuffer(80, 20)
    buf.fill(Color.bgMagenta(), new Rect(80, 20))
    buf.fill(Color.bgBlue(), new Rect(20, 10, 4, 2))
    buf.write(0, 5, Color.white('Jimmy was here'))
    buf.present()
}
