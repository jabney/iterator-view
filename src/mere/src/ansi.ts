/**
 * https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
 */
export const csi = '\x1b['

/**
 * ESC[38;5;⟨n⟩m Select foreground color      where n is a number from the table below
 * ESC[48;5;⟨n⟩m Select background color
 *   0-  7:  standard colors (as in ESC [ 30–37 m)
 *   8- 15:  high intensity colors (as in ESC [ 90–97 m)
 *  16-231:  6 × 6 × 6 cube (216 colors): 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
 * 232-255:  grayscale from dark to light in 24 steps
 */
export function fg8(t: TemplateStringsArray, code: number) {
    const [text] = t.slice(1)
    return `${csi}38;5;${code}m${text}`
}
export function bg8(t: TemplateStringsArray, code: number) {
    const [text] = t.slice(1)
    return `${csi}48;5;${code}m${text}`
}

/**
 * ESC[38;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB foreground color
 * ESC[48;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB background color
 */
export function fg24(t: TemplateStringsArray, r: number, g: number, b: number) {
    const [text] = t.slice(3)
    return `${csi}38;2;${r};${g};${b}m${text}`
}
export function bg24(t: TemplateStringsArray, r: number, g: number, b: number) {
    const [text] = t.slice(3)
    return `${csi}38;2;${r};${g};${b}m${text}`
}

/*
    n           Name                                                            Note
    --          -----                                                           -----
    0           Reset or normal                                                 All attributes become turned off
    1           Bold or increased intensity                                     As with faint, the color change is a PC (SCO / CGA) invention.[25][better source needed]
    2           Faint, decreased intensity, or dim                              May be implemented as a light font weight like bold.[26]
    3           Italic                                                          Not widely supported. Sometimes treated as inverse or blink.[25]
    4           Underline                                                       Style extensions exist for Kitty, VTE, mintty, iTerm2 and Konsole.[27][28][29]
    5           Slow blink                                                      Sets blinking to less than 150 times per minute
    6           Rapid blink                                                     MS-DOS ANSI.SYS, 150+ per minute; not widely supported
    7           Reverse video or invert                                         Swap foreground and background colors; inconsistent emulation[30][dubious – discuss]
    8           Conceal or hide                                                 Not widely supported.
    9           Crossed-out, or strike                                          Characters legible but marked as if for deletion. Not supported in Terminal.app.
    10          Primary (default) font                                      
    11–19       Alternative font                                                Select alternative font n − 10
    20          Fraktur (Gothic)                                                Rarely supported
    21          Doubly underlined; or: not bold                                 Double-underline per ECMA-48,[5]: 8.3.117  but instead disables bold intensity on several terminals, including in the Linux kernel's console before version 4.17.[31]
    22          Normal intensity                                                Neither bold nor faint; color changes where intensity is implemented as such.
    23          Neither italic, nor blackletter                                     
    24          Not underlined                                                  Neither singly nor doubly underlined
    25          Not blinking                                                    Turn blinking off
    26          Proportional spacing                                            ITU T.61 and T.416, not known to be used on terminals
    27          Not reversed                                        
    28          Reveal                                                          Not concealed
    29          Not crossed out                                     
    30–37       Set foreground color                                        
    38          Set foreground color                                            Next arguments are 5;n or 2;r;g;b
    39          Default foreground color                                        Implementation defined (according to standard)
    40–47       Set background color                                        
    48          Set background color                                            Next arguments are 5;n or 2;r;g;b
    49          Default background color                                        Implementation defined (according to standard)
    50          Disable proportional spacing                                        T.61 and T.416
    51          Framed                                                          Implemented as "emoji variation selector" in mintty.[32]
    52          Encircled
    53          Overlined                                                       Not supported in Terminal.app
    54          Neither framed nor encircled                                        
    55          Not overlined                                       
    58          Set underline color                                             Not in standard; implemented in Kitty, VTE, mintty, and iTerm2.[27][28] Next arguments are 5;n or 2;r;g;b.
    59          Default underline color                                         Not in standard; implemented in Kitty, VTE, mintty, and iTerm2.[27][28]
    60          Ideogram underline or right side line                                       Rarely supported
    61          Ideogram double underline, or double line on the right side
    62          Ideogram overline or left side line
    63          Ideogram double overline, or double line on the left side
    64          Ideogram stress marking
    65          No ideogram attributes                                          Reset the effects of all of 60–64
    73          Superscript                                                     Implemented only in mintty[32]
    74          Subscript
    75          Neither superscript nor subscript
    90–97       Set bright foreground color                                     Not in standard; originally implemented by aixterm[16]
    100–107     Set bright background color
*/
