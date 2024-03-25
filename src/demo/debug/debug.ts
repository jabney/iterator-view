import { runScript, waitSeconds } from '../demo-utils'
import { sys } from '../system/system'
import { FrameBufferTest, PanelTest, UITest } from './panel'
import { SurfaceAnim, SurfaceTest } from './surface'

const out = process.stdout

export async function debug() {
    const script = [
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
