import { ArrayView } from './array-view'
import { transform, count, enumerate, inspect } from './iterator'
import { IteratorView } from './iterator-view'
import { Color } from './lib/color'
import { ControlSubject, Scheduler } from './schedule'

async function colors() {
    const subject = new ControlSubject()
    const scheduler = Scheduler.controlled(subject, Scheduler.immediate())

    async function stream1(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .enumerate()

        subject.next(true)

        for await (const x of view) {
            const [i, v] = x
            console.log(`${color(`[${i}]:`).dim} ${color(v).dim}`)
        }
    }

    async function stream2(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .enumerate()

        subject.next(true)

        for await (const x of view) {
            const [i, v] = x
            console.log(`${color(`[${i}]`)}: ${color(v)}`)
        }
    }

    async function stream3(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .enumerate()

        subject.next(true)

        for await (const x of view) {
            const [i, v] = x
            console.log(`${color(`[${i}]`)}: ${color(v)}`)
        }
    }

    async function stream4(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .enumerate()

        subject.next(true)

        for await (const x of view) {
            const [i, v] = x
            console.log(`${color(`[${i}]`)}: ${color(v)}`)
        }
    }

    let num = 0
    let runRandom = true
    function doRandom() {
        const c = Color.random(`other event ${num++}`).bright
        const timeMs = 0 * Math.round(Math.random())
        if (!runRandom) return

        setTimeout(() => {
            console.log(c.random.str)
            doRandom()
        }, timeMs)

        // setImmediate(() => {
        //     console.log(c.random.str)
        //     doRandom()
        // })
    }
    doRandom()

    function doTimeout(run: boolean) {
        setTimeout(() => {
            subject.next(run)
            // doTimeout(!run)
            runRandom = !runRandom
            setTimeout(() => console.log(`\nPaused...\n`), 100)
        }, 100)
    }
    doTimeout(false)

    stream1(Color.white)
    // stream2(Color.red)
    // stream3(Color.green)
    // stream4(Color.blue)
}

async function groupify() {
    const c = Color
    const scheduler = Scheduler.timeout(10)
    const arrayView = ArrayView.create([...count(100)], null, scheduler)
    const view = arrayView
        .filter(x => x % 2 === 0)
        .map(x => x + 1)
        .map(text => ({ color: c.random(), text: `${text}` }))
    // .map(({ color, text }) => ({ key: color.key, mod: color.mod, text: text }))
    // .map(({ color, text }) => ({
    //     key: color.text(color.key).str,
    //     mod: color.text(color.mod).str,
    //     text: color.text(text).str,
    // }))

    // const groups = view.groupify((obj: any) => obj.key)
    // console.log(groups)

    for await (const value of view) {
        const { color, text } = value
        console.log(color.text(`[${color.key}:${color.mod}]:`).str, `${color.text(text)}`)
    }

    // const view2 = new IteratorView(count(100), scheduler)
    //     .filter(x => x % 2 === 0)
    //     .map(x => x + 1)
    //     .map(x => ' ' + x.toString() + ' ')
    //     .transform(text => ({ color: c.random(text), text }))
    //     .map(({ color, text }) => ({
    //         key: color.key,
    //         mod: color.mod,
    //         text,
    //     }))

    // const view3 = new IteratorView(count(100), scheduler).reduce((a, b) => <number>a + b)
    // for await (const v of view3) {
    //     console.log(v)
    // }
}

// colors()
groupify()
