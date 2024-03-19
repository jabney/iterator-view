import EventEmitter from 'events'
import { DisposeFn, KeyType } from '../types'
import { waitFps } from '../../lib/time'
import * as ctr from './ctrl'
import { kb } from './kb'

export interface IInputManager extends ReturnType<typeof InputManager> {}

const keymap = new Map<string, KeyType>([
    [kb.del, 'del'],
    [kb.down, 'down'],
    [kb.enter, 'enter'],
    [kb.left, 'left'],
    [kb.right, 'right'],
    [kb.space, 'space'],
    [kb.up, 'up'],
])

/**
 *
 */
export function InputManager(interrupt: () => void) {
    const emitter = new EventEmitter()
    const name = 'input'
    let running = false

    async function start() {
        if (!running) {
            running = true
            run()
        }
    }

    async function run() {
        const rawMode = process.stdin.isRaw
        process.stdin.setRawMode(true)

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
            if (str === ctr.ETX /* break, ctrl-c */) {
                interrupt()
                return false
            }
            const key = keymap.get(str)

            if (key != null) {
                emitter.emit(name, key)
            }
        }
        return true
    }

    return {
        addListener(fn: (key: KeyType) => void): DisposeFn {
            emitter.addListener(name, fn)

            if (!running) start()

            return () => {
                emitter.removeListener(name, fn)
                if (emitter.listenerCount(name) === 0) {
                    running = false
                }
            }
        },

        get isRunning() {
            return running
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
