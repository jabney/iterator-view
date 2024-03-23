/**
 *
 */
type Range = [number, number]
type Domain = [number, number]

type ScaleFn = (t: number) => number
type MapFn = (t: number) => number

export namespace Scale {
    /**
     *
     */
    export const interpolate = ([min, max]: Domain): ScaleFn => {
        return (t: number) => min + t * (max - min)
    }

    /**
     *
     */
    export const domain = ([d1, d2]: Domain) => {
        return {
            interpolate: interpolate([d1, d2]),

            range: (r: Range, map: MapFn = x => x): ScaleFn => {
                const rscale = interpolate(r)
                return (t: number) => map(rscale((t - d1) / (d2 - d1)))
            },
        }
    }

    /**
     *
     */
    export const range = (r: Range) => {
        return {
            interpolate: interpolate(r),

            domain: ([d1, d2]: Domain, map: MapFn = x => x): ScaleFn => {
                const rscale = interpolate(r)
                return (t: number) => map(rscale((t - d1) / (d2 - d1)))
            },
        }
    }
}
