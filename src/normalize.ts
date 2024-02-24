export const normalizeStart = (length: number, start: number): number => {
    if (start < 0 && -length <= start) {
        return start + length
    }
    if (start < -length) {
        return 0
    }
    if (start >= length) {
        return length
    }
    return start
}

export const normalizeEnd = (length: number, end: number): number => {
    if (end < 0 && -length <= end) {
        return end + length
    }
    if (end < -length) {
        return 0
    }
    if (end >= length) {
        return length
    }
    return end
}
