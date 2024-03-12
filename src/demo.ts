// import { ArrayView } from './array-view'
// import { transform, count, enumerate, inspect } from './iterator'
// import { IteratorView } from './iterator-view'
// import { Color, Stringable } from './lib/color'
// import { timeMs } from './lib/time'
// import { ControlSubject, Scheduler } from './schedule'

import { count } from './iterator'
import { clamp } from './lib/clamp'
import { Color } from './lib/color'
import { fpsMs, time, timeMs, wait, when } from './lib/time'

// async function colors() {
//     const subject = new ControlSubject()
//     const scheduler = Scheduler.timeout(100)
//     // const scheduler = Scheduler.immediate()
//     // const scheduler = Scheduler.controlled(subject, Scheduler.immediate())

//     async function stream1(color: (str: Stringable) => Color) {
//         const view = new IteratorView(count(1e5), scheduler)
//             .filter(x => x % 10 === 0)
//             .map(x => x ** 2)
//             .enumerate()

//         subject.next(true)

//         for await (const x of view) {
//             const [i, v] = x
//             console.log(color(`[${i}]: ${v}`).dim.str)
//         }
//     }

//     // async function doRandom(num: number = 0) {
//     //     const c = Color.white(`event ${num}`)
//     //     // await scheduler.schedule(() => console.log(c.str))
//     //     await Scheduler.soon().schedule(() => console.log(c.str))
//     //     doRandom(num++)
//     // }
//     // doRandom()

//     const seconds = timeMs(5, 'sec')
//     async function doTimeout(run?: boolean) {
//         stream1(Color.white)
//         setTimeout(() => process.exit(0), seconds)
//     }
//     // subject.next(true)
//     doTimeout()
// }

// async function groupify() {
//     const c = Color
//     const scheduler = Scheduler.timeout(10)
//     const arrayView = ArrayView.create([...count(100)], null, scheduler)

//     // const view = arrayView
//     //     .filter(x => x % 2 === 0)
//     //     .map(x => x + 1)
//     //     .map(x => `item #${x}`)
//     //     .map(text => ({ color: c.random(), text: `${text}` }))
//     //     .map(({ color, text }) => ({ key: color.key, text }))

//     // const groups = view.groupify((obj: any) => obj.key)
//     // console.log(groups)

//     const view = arrayView
//         .filter(x => x % 2 === 0)
//         .map(x => x + 1)
//         .map(x => `item #${x}`)
//         .map(text => ({ color: c.random(), text: `${text}` }))

//     for await (const value of view) {
//         const { color, text } = value
//         console.log(color.text(`[${color.key}:${color.mod}]:`).str, `${color.text(text)}`)
//     }
// }

// colors()
// // groupify()

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

const out = process.stdout

const cursor = {
    hide: () => out.write('\x1B[?25l'),
    show: () => out.write('\x1B[?25h'),
}

const lines = (num: number) => '\n'.repeat(clamp(0, 80, num - 1))

const sec = time('sec')

const scroller = (pad: number, speed: number) => async (color: Color, delay: number) => {
    out.write(lines(pad))
    out.write(color.str)
    await wait(sec(delay))

    while (pad-- > 0) {
        await wait(fpsMs(speed))
        console.clear()
        out.write(lines(pad))
        out.write(color.str)
    }
    console.clear()
}

// const scroll = async (num: number, ms: number) => {
//     while (num > 0) {
//         num -= 1
//         await when(ms, () => lines(1))
//     }
// }

const t = {
    inset: (num: number) => ' '.repeat(num),
    insetStr: (str: string, ins: number) => `${t.inset(ins)}${str}${t.blank()}`,
    blank: () => '\n',
    // insetStr: (c: Color, ins: number) => (w.inset(ins), out.write(c.str), w.blank()),
}

const w = {
    line: (c: Color) => void (out.write(c.str), w.blank),
    inset: (num: number) => void out.write(' '.repeat(num)),
    blank: () => out.write('\n'),
    repeat: (c: Color, num: number) => out.write(c.str.repeat(num)),
    insetStr: (c: Color, ins: number) => void (w.inset(ins), out.write(c.str), w.blank()),
}

const titleWidth = 60

const writeTitle = (colors: Color[], pad: number, inset: number) => {
    const title = colors[0]
    const c = title
    out.write(lines(pad))

    // top line
    w.inset(inset)
    w.repeat(c.text('-'), titleWidth)
    w.blank()

    w.insetStr(c.text(`* ${title}`), inset)
    w.insetStr(c.text('*'), inset)

    for (const line of colors.slice(1)) {
        w.insetStr(c.text(`* ${line}`), inset)
    }

    w.inset(inset)
    w.repeat(c.text('-'), titleWidth)
    w.blank()
}

async function intro() {
    const padding = 12
    const c = Color.green()
    const scroll = scroller(padding + 2, 10)

    const title = [
        //
        `A Demo of Total Concurrency for Array Processing`,
        ` with a potential for reduced memory and CPU usage`,
    ].map(x => c.text(x))

    const t2text = `Yeah right`
    const title2 = t.insetStr(t2text, 2 * padding + 0.5 * titleWidth - 0.5 * t2text.length)
    // const title2 = `${t.inset(60)}...Yeah right.`

    const script = [
        async () => cursor.hide(),
        async () => console.clear(),

        async () => writeTitle(title, padding, 2 * padding),
        async () => await when(sec(5), () => console.clear()),
        async () => when(sec(1), () => scroll(c.text(title2), 2)),
        async () => wait(sec(2)),

        async () => cursor.show(),
    ]

    for (const i of count(script.length)) {
        await script[i]()
    }
}

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

async function run() {
    await intro()
}

run()
