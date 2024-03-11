import { transform, count, enumerate, inspect } from './iterator'
import { IteratorView } from './iterator-view'
import { Color } from './lib/color'
import { ControlSubject, Scheduler } from './schedule'

async function colors() {
    const subject = new ControlSubject()
    const scheduler = Scheduler.controlled(subject, Scheduler.timeout(100))

    async function white(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .index()

        subject.next(true)

        for await (const i of view) {
            console.log(`${color(i)}`)
        }
    }

    async function red(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .index()

        subject.next(true)

        for await (const i of view) {
            console.log(`${color(i)}`)
        }
    }

    async function green(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .index()

        subject.next(true)

        for await (const i of view) {
            console.log(`${color(i)}`)
        }
    }

    async function blue(color: (str: { toString(): string }) => Color) {
        const view = new IteratorView(count(Infinity), scheduler)
            .filter(x => x % 10 === 0)
            .map(x => x ** 2)
            .index()

        subject.next(true)

        for await (const i of view) {
            console.log(`${color(i)}`)
        }
    }

    function doTimeout(run: boolean) {
        setTimeout(() => {
            subject.next(run)
            doTimeout(!run)
        }, 5000)
    }
    doTimeout(false)

    white(Color.white)
    red(Color.red)
    green(Color.green)
    blue(Color.blue)
}

async function groupify() {
    const c = Color
    const scheduler = Scheduler.timeout(200)
    const view = new IteratorView(count(1000), scheduler)
        .filter(x => x % 2 === 0)
        .map(x => x + 1)
        .map(x => ' ' + x.toString() + ' ')
        .transform(text => ({ color: c.random(text), text }))
        .map(({ color, text }) => ({
            key: color.text(color.key).str,
            mod: color.text(color.mod).str,
            text: color.text(text).str,
        }))

    // for await (const v of view) {
    //     console.log(v.key, v.mod, v.text)
    // }

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

    // // const key = (value: number) => value % 10
    // const groups = view2.groupify((obj: any) => obj.mod)
    // console.log(groups)

    const view3 = new IteratorView(count(100), scheduler).reduce((a, b) => <number>a + b)
    for await (const v of view3) {
        console.log(v)
    }
}

// colors()
groupify()
