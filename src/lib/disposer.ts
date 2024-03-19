import { DisposeFn } from '../demo/types'

export class Disposer {
    private disposers: Set<DisposeFn> | null = new Set()

    readonly add = (...args: DisposeFn[]): void => {
        if (this.disposers != null) {
            for (const fn of args) this.disposers.add(fn)
        } else {
            throw new Error('<Disposer.add> disposer is destroyed')
        }
    }

    readonly destroy = () => {
        if (this.disposers != null) {
            for (const fn of this.disposers) {
                fn()
            }
            this.disposers.clear()
            this.disposers = null
        } else {
            throw new Error('<Disposer.add> disposer is destroyed')
        }
    }
}
