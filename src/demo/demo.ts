import { count } from '../iterator'
import { IteratorView } from '../iterator-view'
import { Color } from '../lib/color'
import { fpsMs, timeUnit, waitMs, whenMs } from '../lib/time'
import { Scheduler } from '../schedule'
import { Panel, TextPanel } from './panel'
import { Controller } from './controller'
import { runScript, scroller, text as t, unfold, write as w, waitSeconds, whenSeconds } from './demo-utils'
import { sys } from './system/system'
import { IPoint, IRect, IUnfoldItem, AsyncFn } from './types'
import { Point } from './panel/point'
import { Rect } from './panel/rect'

const out = process.stdout

const fallbackBg = (c: Color | string, fb: Color) => {
    return typeof c === 'string' ? fb.bg.text(c) : c
}

const Pad: Readonly<IPoint> = { x: 6, y: 3 }

const writeTitle = (colors: Color[], rect: IRect) => {
    const title = colors[0]
    const c = title

    const width = rect.width
    const pos = new Point(rect.x, rect.y)
    const border = { vert: '*', horz: '-' }

    // top margin
    w.blank(pos.y)

    // top line
    w.inset(pos.x, c.text(t.repeat(rect.width, border.horz)))
    // w.repeat(width, c.text(border.horz))
    // w.blank()

    w.inset(pos.x, c.text(`${border.vert} ${title}`))
    w.inset(pos.x, c.text(`${border.vert}`))

    for (const line of colors.slice(1)) {
        w.inset(pos.x, c.text(`${border.vert} ${line}`))
    }

    w.inset(pos.x, c.text(t.repeat(width, border.horz)))
    // w.repeat(width, c.text(border.horz))
    w.blank()
}

const writeHeading = (heading: Color, rect: IRect, underline?: Color | string) => {
    const h = heading
    const pos = new Point(rect.x, rect.y)

    // top margin
    w.blank(pos.y)

    // Heading
    w.inset(pos.x, h.text(`${heading.str}`))

    if (underline != null) {
        const ul = fallbackBg(underline, h)
        w.inset(pos.x, ul.text(t.repeat(h.raw!.length, ul.raw ?? '-')))
    }
}

const rectTitle = new Rect(60, 0, Pad.x, Pad.y)

async function intro() {
    const c = Color.green()
    const scroll = scroller({ x: 0, y: Pad.y + 2 }, 8)

    const content = [
        //
        `A Demo of Total Concurrency for Array Processing`,
        `with lower CPU usage and fewer memory allocations`,
    ]
    const title = content.map(x => c.text(x))

    const t2text = `Yeah right`
    const t2offset = Pad.x + 0.4 * rectTitle.width - 0.5 * t2text.length
    const title2 = t.inset(t2offset, t2text)

    const script: (() => Promise<void>)[] = [
        async () => void console.clear(),

        // async () => w.writeln(c.text(`${t2offset}`)),
        async () => writeTitle(title, rectTitle),
        async () => whenSeconds(5, () => console.clear()),
        async () => whenSeconds(1, () => scroll(c.text(title2).bright, 2)),
        async () => waitSeconds(1),
    ]

    await runScript(script)
}

async function Demo_LazyTimeout(ctrl = new Controller()) {
    const c = Color

    const stream1 = async (timeout: number) => {
        const view = new IteratorView(count(Infinity), Scheduler.timeout(timeout))
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .enumerate()

        for await (const [i, v] of view) {
            if (ctrl.halt === true) break
            w.inset(Pad.x, c.text(`[${i}]: ${v}`).dim)
        }
    }

    const stream2 = async (min: number, max: number) => {
        const view = new IteratorView(count(Infinity), Scheduler.random(min, max))

        for await (const i of view) {
            if (ctrl.halt === true) break
            w.inset(Pad.x, c.text(`[Event ${i}]`))
        }
    }
    const pos = new Point(rectTitle.x, rectTitle.y)

    const a = {
        title: c.text('Demo: Very Lazy Iteration'),
        lines: [
            { color: c.text(`- A basic iterator, processing 1 value every 100ms`), seconds: 3, point: pos },
            { color: c.text(`- Then another iterator stream, mixed in spontaneously`), seconds: 3, point: pos },
        ] as IUnfoldItem[],
    }

    const b = {
        title: c.text('Demo: Very Lazy Iteration'),
        lines: [
            { color: c.text(`- A basic iterator, processing 1 value every 100ms`), seconds: 0, point: pos },
            { color: c.text(`- Then another iterator stream, mixed in spontaneously`), seconds: 2, point: pos },
            { color: c.text(`- Now let's try 0ms`), seconds: 3, point: pos },
        ] as IUnfoldItem[],
    }

    const script: AsyncFn[] = [
        async () => void console.clear(),
        async () => writeHeading(a.title.bright, rectTitle),
        async () => waitSeconds(2),
        async () => unfold(a.lines),
        async () => w.blank(),
        async () => void stream1(100),
        async () => waitSeconds(3),
        async () => void stream2(500, 800),
        async () => whenSeconds(4, () => void (ctrl.halt = true)),
        async () => waitSeconds(1),
        async () => void console.clear(),
        //
        async () => writeHeading(b.title.bright, rectTitle),
        async () => unfold(b.lines),
        async () => w.blank(),
        async () => void (ctrl.halt = false),
        async () => void stream1(0),
        async () => void stream2(50, 80),
        async () => whenSeconds(2, () => void (ctrl.halt = true)),
        async () => writeHeading(c.text(`That was faster.`), rectTitle),
        async () => waitSeconds(2),

        async () => void 0,
        async () => void 0,
    ]

    await runScript(script)
}

async function Demo_Immediate(ctrl = new Controller()) {
    const c = Color

    const stream1 = async (timeout: number) => {
        const view = new IteratorView(count(Infinity), Scheduler.immediate())
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .enumerate()

        for await (const [i, v] of view) {
            if (ctrl.halt === true) break
            w.inset(Pad.x, c.text(`[${i}]: ${v}`).dim)
        }
    }

    const stream2 = async (min: number, max: number) => {
        const view = new IteratorView(count(Infinity), Scheduler.random(min, max))

        for await (const i of view) {
            if (ctrl.halt === true) break
            w.inset(Pad.x, c.text(`[Event ${i}]`))
        }
    }
    const pos = new Point(rectTitle.x, rectTitle.y)

    const title1 = c.text(`Now let's see immediate scheduling`)
    const title2 = c.text(`That was with the secondary events at 0 ms`)

    const script: AsyncFn[] = [
        async () => void console.clear(),
        async () => writeHeading(title1.bright, rectTitle),
        async () => waitSeconds(2),
        // async () => unfold(data.lines),
        async () => w.blank(),
        async () => void stream1(100),
        // async () => waitSeconds(3),
        async () => void stream2(0, 0),
        async () => whenSeconds(3, () => void (ctrl.halt = true)),
        async () => waitSeconds(2),
        async () => void console.clear(),
        async () => writeHeading(title2.bright, rectTitle),
        async () => waitSeconds(4),

        async () => void console.clear(),
        //
        // async () => writeHeading(b.title.bright, rectTitle),
    ]

    await runScript(script)
}

export async function demo() {
    const script = [
        async () => sys.hideCursor(),
        async () => void console.clear(),
        //
        async () => await intro(),
        //
        async () => await Demo_LazyTimeout(),
        //
        async () => await Demo_Immediate(),
        //
        async () => void console.clear(),
        async () => void sys.writeln('\n'),
        async () => void sys.showCursor(),
    ]

    await runScript(script)
}

demo()

/**
 *
 */

// var spawn = require('child_process').spawn
// function getTermSize(cb){
//     spawn('resize').stdout.on('data', function(data){
//         data = String(data)
//         var lines = data.split('\n'),
//             cols = Number(lines[0].match(/^COLUMNS=([0-9]+);$/)[1]),
//             lines = Number(lines[1].match(/^LINES=([0-9]+);$/)[1])
//         if (cb)
//             cb(cols, lines)
//     })
// }

/**
 *
 */

async function problems() {
    // What's the issue?
    //
    // Maybe nothing, but...
    //
    // 1.
    // map, filter, slice, and reduce, always add memory, especially for large arrays
    // which makes the garbage collector work.
    //
    // Perhaps that's fine - at least it may not be a big deal.
    // However...
    //
    // 2.
    // For every array operation, the CPU thread is blocked. This includes UI, which suffers the most.
    // Laggy UI, choppy animation, delayed button click actions, and stuttering loading spinners aren't great.
    //
    // If overall time to complete a set of tasks isn't a priority, then spreading every array operation call
    // over the event queue might improve perceived performance.
    /**
     * ```
     * const array = [...tenThousandModels]
     * array.map((x) => transform(x))
     * ```
     *
     * That's 10,000 synchronous transformation operations, and the memory usage has possibly doubled.
     *
     * Each transform op can essentaially be spread into the event queue, along with other application events
     * occurring at the same time. The time between operations can be controlled, and the whole set of transform
     * operations can be suspended and resumed at will.
     *
     *
     */
    /**
     * DEMO very lazy iteration: timeout scheduling of 10-100 ms between processing of each array element.
     *
     * With intervening events.
     */
    /**
     * DEMO timeout scheduling of 0ms.
     */
    /**
     * DEMO immediate scheduling.
     */
    /**
     * DEMO simultanious immediate scheduling, 3-4 array operations running concurrently.
     */
}
