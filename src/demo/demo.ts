import { count } from '../iterator'
import { IteratorView } from '../iterator-view'
import { Color } from '../lib/color'
import { fpsMs, timeUnit, waitMs, whenMs } from '../lib/time'
import { Scheduler } from '../schedule'
import { Panel, TextPanel } from './Panel'
import { Controller } from './controller'
import { scroller, text as t, unfold, write as w } from './demo-utils'
import { System } from './system'
import { IPoint, IRect, Rect, IUnfoldItem, AsyncFn, Point, Insets } from './types'

const out = process.stdout

const fromSeconds = timeUnit('sec')
const whenSeconds = <T>(sec: number, action: () => T | Promise<T>) => whenMs(fromSeconds(sec), action)
const waitSeconds = (sec: number) => waitMs(fromSeconds(sec))
const fps60 = fpsMs(60)

const fallbackBg = (c: Color | string, fb: Color) => {
    return typeof c === 'string' ? fb.bg.text(c) : c
}

const Pad: Readonly<IPoint> = { x: 6, y: 3 }

const system = new System()

const writeTitle = (colors: Color[], rect: IRect) => {
    const title = colors[0]
    const c = title

    const width = rect.width
    const pos = rect.pos
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

    // top margin
    w.blank(rect.pos.y)

    // Heading
    w.inset(rect.pos.x, h.text(`${heading.str}`))

    if (underline != null) {
        const ul = fallbackBg(underline, h)
        w.inset(rect.pos.x, ul.text(t.repeat(h.raw!.length, ul.raw ?? '-')))
    }
}

async function runScript(script: (() => Promise<void>)[]) {
    for (const i of count(script.length)) {
        await script[i]()
    }
}

const rectTitle = new Rect(60, 0, { x: Pad.x, y: Pad.y })

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
        async () => void system.cursor.hide(),
        async () => void console.clear(),

        // async () => w.writeln(c.text(`${t2offset}`)),
        async () => writeTitle(title, rectTitle),
        async () => whenSeconds(5, () => console.clear()),
        async () => whenSeconds(1, () => scroll(c.text(title2).bright, 2)),
        async () => waitSeconds(1),

        async () => void system.cursor.show(),
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

    const a = {
        title: c.text('Demo: Very Lazy Iteration'),
        lines: [
            { color: c.text(`- A basic iterator, processing 1 value every 100ms`), seconds: 3, point: rectTitle.pos },
            { color: c.text(`- Then another iterator stream, mixed in spontaneously`), seconds: 3, point: rectTitle.pos },
        ] as IUnfoldItem[],
    }

    const b = {
        title: c.text('Demo: Very Lazy Iteration'),
        lines: [
            { color: c.text(`- A basic iterator, processing 1 value every 100ms`), seconds: 0, point: rectTitle.pos },
            { color: c.text(`- Then another iterator stream, mixed in spontaneously`), seconds: 2, point: rectTitle.pos },
            { color: c.text(`- Now let's try 0ms`), seconds: 3, point: rectTitle.pos },
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

    const a = {
        title: c.text('Demo: Very Lazy Iteration'),
        lines: [
            { color: c.text(`- A basic iterator, processing 1 value every 100ms`), seconds: 3, point: rectTitle.pos },
            { color: c.text(`- Then another iterator stream, mixed in spontaneously`), seconds: 3, point: rectTitle.pos },
        ] as IUnfoldItem[],
    }

    const b = {
        title: c.text('Demo: Very Lazy Iteration'),
        lines: [
            { color: c.text(`- A basic iterator, processing 1 value every 100ms`), seconds: 0, point: rectTitle.pos },
            { color: c.text(`- Then another iterator stream, mixed in spontaneously`), seconds: 2, point: rectTitle.pos },
            { color: c.text(`- Now let's try 0ms`), seconds: 3, point: rectTitle.pos },
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
        async () => void 0,
    ]

    await runScript(script)
}

async function PanelTest() {
    const panel = new Panel(
        //
        new Rect(48, 12, new Point(0, 0)),
        new Insets(1, 2),
        Color.bgWhite()
    )
    const text = Color.magenta('This is a text panel').bgBlue
    const width = text.str.length
    const height = 2
    const textPanel = new TextPanel(text, new Rect(width, height, new Point()))
    panel.addChild(textPanel)
    panel.render()
    await waitSeconds(5)
}

export async function demo() {
    system.cursor.hide()

    const script = [
        async () => void console.clear(),
        //
        // async () => await intro(),
        //
        async () => await PanelTest(),
        //
        // async () => await Demo_LazyTimeout(),
        //
        // async () => void console.clear(),
    ]

    await runScript(script)
    system.cursor.show()
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
