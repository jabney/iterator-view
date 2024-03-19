import { CR as CT_CR, DEL as CT_DEL, SPC as CT_SPC } from './ctrl'

export const ENTER = CT_CR
export const SPACE = CT_SPC
export const DEL = CT_DEL

export const UP = '\x1b\x5b\x41'
export const DOWN = '\x1b\x5b\x42'
export const RIGHT = '\x1b\x5b\x43'
export const LEFT = '\x1b\x5b\x44'

export const kb = {
    enter: ENTER,
    space: SPACE,
    del: DEL,
    up: UP,
    down: DOWN,
    right: RIGHT,
    left: LEFT,
}

export type Keyboard = typeof kb
