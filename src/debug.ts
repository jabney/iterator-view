import { ArrayView } from './array-view'
import { transform, count, enumerate, inspect } from './iterator'
import { IteratorView } from './iterator-view'
import { Color, Stringable } from './lib/color'
import { timeMs } from './lib/time'
import { ControlSubject, Scheduler } from './schedule'

async function colors() {
    const subject = new ControlSubject()
    const scheduler = Scheduler.timeout(100)
    // const scheduler = Scheduler.immediate()
    // const scheduler = Scheduler.controlled(subject, Scheduler.immediate())

    async function stream1(color: (str: Stringable) => Color) {
        const view = new IteratorView(count(1e5), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .enumerate()

        subject.next(true)

        for await (const x of view) {
            const [i, v] = x
            console.log(color(`[${i}]: ${v}`).dim.str)
        }
    }

    // async function doRandom(num: number = 0) {
    //     const c = Color.white(`event ${num}`)
    //     // await scheduler.schedule(() => console.log(c.str))
    //     await Scheduler.soon().schedule(() => console.log(c.str))
    //     doRandom(num++)
    // }
    // doRandom()

    const seconds = timeMs(5, 'sec')
    async function doTimeout(run?: boolean) {
        stream1(Color.white)
        setTimeout(() => process.exit(0), seconds)
    }
    // subject.next(true)
    doTimeout()
}

async function groupify() {
    const c = Color
    const scheduler = Scheduler.timeout(10)
    const arrayView = ArrayView.create([...count(100)], null, scheduler)

    // const view = arrayView
    //     .filter(x => x % 2 === 0)
    //     .map(x => x + 1)
    //     .map(x => `item #${x}`)
    //     .map(text => ({ color: c.random(), text: `${text}` }))
    //     .map(({ color, text }) => ({ key: color.key, text }))

    // const groups = view.groupify((obj: any) => obj.key)
    // console.log(groups)

    const view = arrayView
        .filter(x => x % 2 === 0)
        .map(x => x + 1)
        .map(x => `item #${x}`)
        .map(text => ({ color: c.random(), text: `${text}` }))

    for await (const value of view) {
        const { color, text } = value
        console.log(color.text(`[${color.key}:${color.mod}]:`).str, `${color.text(text)}`)
    }
}

colors()
// groupify()
