import { count, enumerate } from '../iterator'
import { IteratorView } from '../iterator-view'
import { clamp } from '../lib/clamp'
import { Color, Stringable } from '../lib/color'
import { fpsMs, timeUnit, timeMs, wait, when } from '../lib/time'
import { IScheduler, Scheduler } from '../schedule'
import { IPoint, IUnfoldItem, Point } from './types'

const out = process.stdout

export const cursor = Object.freeze({
    hide: () => out.write('\x1B[?25l'),
    show: () => out.write('\x1B[?25h'),
})

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
    while (ctrl.pause) await wait(pollMs)
}

export const scroller = (point: IPoint, fps: number) => async (color: Color, delay: number) => {
    write.blank(point.y)
    out.write(color.str)
    await wait(sec(delay))

    let lines = point.y
    while ((lines -= 1) >= 0) {
        // console.log(' ', lines)
        await wait(fpsMs(fps))
        console.clear()
        write.blank(lines)
        out.write(color.str)
    }
    console.clear()
}

export const unfold = async (items: IUnfoldItem[]) => {
    for (const { color, seconds = 0, point = { x: 0, y: 0 } } of items) {
        write.inset(point.x, color)
        await wait(sec(seconds))
    }
}
