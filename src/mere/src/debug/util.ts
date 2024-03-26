import { count } from '../iteration'
import { fpsMs, timeUnit, waitMs, whenMs } from '../time'

export const sec = timeUnit('sec')

export interface IUntil {
    pause?: boolean
}

export const until = async (ctrl: IUntil, pollMs: number) => {
    while (ctrl.pause) await waitMs(pollMs)
}

export async function runScript(script: (() => Promise<void>)[]) {
    for (const i of count(script.length)) {
        await script[i]()
    }
}

export async function runScenes(script: (() => Promise<void>)[]) {
    for (const i of count(script.length)) {
        await script[i](/* inject stuff here */)
    }
}

export const fromSeconds = timeUnit('sec')
export const whenSeconds = <T>(sec: number, action: () => T | Promise<T>) => whenMs(fromSeconds(sec), action)
export const waitSeconds = (sec: number) => waitMs(fromSeconds(sec))
export const fps60 = fpsMs(60)
