import { count } from '../iterator'
import { Color } from '../lib/color'
import { fpsMs, timeUnit, waitMs, whenMs } from '../lib/time'
import { IPoint, IUnfoldItem } from './types'

const out = process.stdout

export const sec = timeUnit('sec')

export const text = {
    repeat: (num: number, s: string) => s.repeat(num),
    inset: (num: number, s = '') => ' '.repeat(num) + s,
    blank: (num: number = 1) => text.crlf.repeat(num),

    get crlf() {
        return '\n'
    },
}

export const write = {
    writeln: (c: Color) => void out.write(`${c.str}\n`),
    inset: (num: number, c = Color.text('')) => void out.write(`${text.inset(num, c.str)}\n`),
    blank: (num: number = 1) => void out.write(`${text.blank(num)}\n`),
    repeat: (num: number, c: Color) => void out.write(`${c.str.repeat(num)}\n`),
}

export interface IUntil {
    pause?: boolean
}

export const until = async (ctrl: IUntil, pollMs: number) => {
    while (ctrl.pause) await waitMs(pollMs)
}

export const scroller = (point: IPoint, fps: number) => async (color: Color, delay: number) => {
    write.blank(point.y)
    out.write(color.str)
    await waitMs(sec(delay))

    let lines = point.y
    while ((lines -= 1) >= 0) {
        await waitMs(fpsMs(fps))
        console.clear()
        write.blank(lines)
        out.write(color.str)
    }
    console.clear()
}

export const unfold = async (items: IUnfoldItem[]) => {
    for (const { color, seconds = 0, point = { x: 0, y: 0 } } of items) {
        write.inset(point.x, color)
        await waitMs(sec(seconds))
    }
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
