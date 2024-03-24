/**
 *
 */
type Range = [number, number]
type Domain = [number, number]
type MapFn = (t: number) => number

export namespace Scale {
    /**
     *
     */
    export function interpolate([min, max]: Domain) {
        return (t: number) => min + t * (max - min)
    }
    /**
     *
     */
    export function domain([d1, d2]: Domain) {
        return {
            range(r: Range, map: MapFn = x => x) {
                const rscale = interpolate(r)
                return (t: number) => map(rscale((t - d1) / (d2 - d1)))
            },
        }
    }
    /**
     *
     */
    export function range(r: Range) {
        return {
            domain([d1, d2]: Domain, map: MapFn = x => x) {
                const rscale = interpolate(r)
                return (t: number) => map(rscale((t - d1) / (d2 - d1)))
            },
        }
    }
}
