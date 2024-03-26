import { runScript, waitSeconds } from './util'
import { SurfaceAnim } from './sfc'
import { hideCursor, showCursor } from './cursor'
import { Border } from '../border'
import { Rect } from '../rect'
import { Insets } from '../insets'

const out = process.stdout

const DrawBorder = async () => {
    const rect = new Rect(80, 30)
    const insets = new Insets()

    const b = new Border(rect, insets)
    b.draw()
}

export async function debug() {
    console.clear()
    hideCursor()

    const script = [
        //
        // async () => await SurfaceTest(),
        //
        async () => await SurfaceAnim(),
        //
        // async () => await DrawBorder(),
        //
        async () => await waitSeconds(999),
    ]

    await runScript(script)
    showCursor()
}

debug()
