export type TimeUnit = 'ms' | 'sec' | 'min' | 'hr' | 'day' | 'week' | 'month' | 'year'

export const timeMs = (time: number, unit: TimeUnit): number => {
    switch (unit) {
        case 'ms':
            return Math.round(time)
        case 'sec':
            return timeMs(1000 * time, 'ms')
        case 'min':
            return timeMs(60 * time, 'sec')
        case 'hr':
            return timeMs(60 * time, 'min')
        case 'day':
            return timeMs(24 * time, 'hr')
        case 'week':
            return timeMs(7 * time, 'day')
        case 'month':
            return timeMs(time / 12, 'year')
        case 'year':
            return timeMs(365.25 * time, 'day')
    }
}

export const timeUnit = (unit: TimeUnit) => (t: number) => timeMs(t, unit)

export const fpsMs = (rate: number) => 1000 / rate

export const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

export const when = async <T = void>(ms: number, action: () => T | Promise<T>) => {
    await wait(ms)
    return await action()
}
