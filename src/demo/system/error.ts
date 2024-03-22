export class ValueError extends Error {
    constructor(value: any, msg = 'invalid value') {
        super(`${msg}: ${value}`)
    }
}
