import EventEmitter from 'events'
import { Disposer } from '../types'
import { waitFps } from '../../lib/time'
import * as ctrl from './ctrl'

/**
 *
 */
export function InputManager(interrupt: () => void) {
    const emitter = new EventEmitter()
    const name = 'input'
    let running = false

    async function start() {
        const rawMode = process.stdin.isRaw
        process.stdin.setRawMode(true)
        running = true
        while (readInput()) {
            if (!running) break
            await waitFps(30)
        }
        process.stdin.setRawMode(rawMode)
    }

    function readInput(): boolean {
        const data: Buffer = process.stdin.read()
        if (data != null) {
            const str = data.toString()
            if (str === ctrl.ETX) {
                interrupt()
                return false
            }
            emitter.emit(name, str)
        }
        return true
    }

    return {
        addListener(fn: (char: string) => void): Disposer {
            emitter.addListener(name, fn)

            if (!running) start()

            return () => {
                emitter.removeListener(name, fn)
                if (emitter.listenerCount(name) === 0) {
                    running = false
                }
            }
        },

        stop() {
            running = false
        },

        destroy() {
            this.stop()
            emitter.removeAllListeners(name)
        },
    }
}
