import EventEmitter from 'events'
import { DisposeFn } from '../types'
import { waitFps } from '../../lib/time'

export interface ITimerManager extends ReturnType<typeof TimerManager> {}

/**
 *
 */
export function TimerManager(fps = 60) {
    const emitter = new EventEmitter()
    const name = 'timer'
    let running = false

    async function start() {
        if (!running) {
            running = true
            run()
        }
    }

    async function run() {
        let start = process.hrtime.bigint()

        while (true) {
            if (hasListeners()) {
                const end = process.hrtime.bigint()
                await waitFps(fps)
                const elapsed = end - start
                emitter.emit('timer', Number(elapsed) / 1e6) // to ms
            } else {
                running = false
                break
            }
        }
    }

    function hasListeners() {
        return emitter.listenerCount(name) > 0
    }

    return {
        addListener(fn: (elapsed: number) => void): DisposeFn {
            emitter.addListener(name, fn)

            if (!running) start()

            return () => {
                emitter.removeListener(name, fn)
                if (emitter.listenerCount(name) === 0) {
                    running = false
                }
            }
        },

        get isRunning(): boolean {
            return running
        },

        stop(): void {
            running = false
        },

        destroy(): void {
            this.stop()
            emitter.removeAllListeners(name)
        },
    }
}
