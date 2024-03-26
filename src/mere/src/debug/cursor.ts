export function hideCursor() {
    return void process.stdout.write('\x1B[?25l')
}

export function showCursor() {
    return void process.stdout.write('\x1B[?25h')
}
