# Notes

## Ansi Escape Codes

[Ansi Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)

### Excerpts

[C0 control codes](https://en.wikipedia.org/w/index.php?title=ANSI_escape_code&action=edit&section=5)

> Almost all users assume some functions of some single-byte characters. Initially defined as part of ASCII, the default C0 control code set is now defined in ISO 6429 (ECMA-48), making it part of the same standard as the C1 set invoked by the ANSI escape sequences (although ISO 2022 allows the ISO 6429 C0 set to be used without the ISO 6429 C1 set, and vice versa, provided that 0x1B is always ESC). This is used to shorten the amount of data transmitted, or to perform some functions that are unavailable from escape sequences:

    Popular C0 control codes:

    ^	C0      Abbr	Name	            Effect
    --  ---     -----   -----               -------
    ^G	0x07	BEL	    Bell	            Makes an audible noise.
    ^H	0x08	BS	    Backspace	        Moves the cursor left (but may "backwards wrap" if cursor is at start of line).
    ^I	0x09	HT	    Tab	                Moves the cursor right to next multiple of 8.
    ^L	0x0C	FF	    Form Feed	        Move a printer to top of next page.
    ^M	0x0D	CR	    Carriage Return	    Moves the cursor to column zero.
    ^[	0x1B	ESC	    Escape	            Starts all the escape sequences.

> Escape sequences vary in length. The general format for an ANSI-compliant escape sequence is defined by ANSI X3.41 (equivalent to ECMA-35 or ISO/IEC 2022).[15]: 13.1  The escape sequences consist only of bytes in the range 0x20—0x7F (all the non-control ASCII characters), and can be parsed without looking ahead. The behavior when a control character, a byte with the high bit set, or a byte that is not part of any valid sequence, is encountered before the end is undefined.

#### Example

```ts
// control byte ^
const ctrl = '\x1B'
// escape ^[
const esc = '\x1B['
```

[Fe Escape sequences](https://en.wikipedia.org/w/index.php?title=ANSI_escape_code&action=edit&section=6)

> If the ESC is followed by a byte in the range 0x40 to 0x5F, the escape sequence is of type Fe. Its interpretation is delegated to the applicable C1 control code standard.[15]: 13.2.1  Accordingly, all escape sequences corresponding to C1 control codes from ANSI X3.64 / ECMA-48 follow this format.[5]: 5.3.a
>
> The standard says that, in 8-bit environments, the control functions corresponding to type Fe escape sequences (those from the set of C1 control codes) can be represented as single bytes in the 0x80–0x9F range.[5]: 5.3.b  This is possible in character encodings conforming to the provisions for an 8-bit code made in ISO 2022, such as the ISO 8859 series. However, in character encodings used on modern devices such as UTF-8 or CP-1252, those codes are often used for other purposes, so only the 2-byte sequence is typically used. In the case of UTF-8, representing a C1 control code via the C1 Controls and Latin-1 Supplement block results in a different two-byte code (e.g. 0xC2,0x8E for U+008E), but no space is saved this way.

    Some type Fe (C1 set element) ANSI escape sequences:

    Code	    C1	    Abbr	Name	                        Effect
    -----       ---     -----   -----                           -------
    ESC N	    0x8E	SS2	    Single Shift Two
    ESC O	    0x8F	SS3	    Single Shift Three
    ESC P	    0x90	DCS	    Device Control String
    ESC \	    0x9C	ST	    String Terminator
    ESC ]	    0x9D	OSC	    Operating System Command
    ESC X	    0x98	SOS	    Start of String
    ESC ^	    0x9E	PM	    Privacy Message
    ESC _	    0x9F	APC	    Application Program Command

[CSI (Control Sequence Introducer) sequences](https://en.wikipedia.org/w/index.php?title=ANSI_escape_code&action=edit&section=7)

> For Control Sequence Introducer, or CSI, commands, the ESC [ (written as \e[ or \033[ in several programming languages) is followed by any number (including none) of "parameter bytes" in the range 0x30–0x3F (ASCII 0–9:;<=>?), then by any number of "intermediate bytes" in the range 0x20–0x2F (ASCII space and !"#$%&'()\*+,-./), then finally by a single "final byte" in the range 0x40–0x7E (ASCII @A–Z[\]^\_`a–z{|}~).[5]: 5.4
>
> All common sequences just use the parameters as a series of semicolon-separated numbers such as 1;2;3. Missing numbers are treated as 0 (1;;3 acts like the middle number is 0, and no parameters at all in ESC[m acts like a 0 reset code). Some sequences (such as CUU) treat 0 as 1 in order to make missing parameters useful.[5]: F.4.2
>
> A subset of arrangements was declared "private" so that terminal manufacturers could insert their own sequences without conflicting with the standard. Sequences containing the parameter bytes <=>? or the final bytes 0x70–0x7E (p–z{|}~) are private.
>
> The behavior of the terminal is undefined in the case where a CSI sequence contains any character outside of the range 0x20–0x7E. These illegal characters are either C0 control characters (the range 0–0x1F), DEL (0x7F), or bytes with the high bit set. Possible responses are to ignore the byte, to process it immediately, and furthermore whether to continue with the CSI sequence, to abort it immediately, or to ignore the rest of it.[citation needed]

    Some ANSI control sequence

    Code	        Abbr	    Name	                        Effect
    CSI n A	        CUU	        Cursor Up	                    Moves the cursor n (default 1) cells in the given direction. If the cursor is already at the edge of the screen, this has no effect.
    CSI n B	        CUD	        Cursor Down
    CSI n C	        CUF	        Cursor Forward
    CSI n D	        CUB	        Cursor Back
    CSI n E	        CNL	        Cursor Next Line	            Moves cursor to beginning of the line n (default 1) lines down. (not ANSI.SYS)
    CSI n F	        CPL	        Cursor Previous Line	        Moves cursor to beginning of the line n (default 1) lines up. (not ANSI.SYS)
    CSI n G	        CHA	        Cursor Horizontal Absolute	    Moves the cursor to column n (default 1). (not ANSI.SYS)
    CSI n ; m H	    CUP	        Cursor Position	                Moves the cursor to row n, column m. The values are 1-based, and default to 1 (top left corner) if omitted. A sequence such as CSI ;5H is a synonym for CSI 1;5H as well as CSI 17;H is the same as CSI 17H and CSI 17;1H
    CSI n J	        ED	        Erase in Display	            Clears part of the screen. If n is 0 (or missing), clear from cursor to end of screen. If n is 1, clear from cursor to beginning of the screen. If n is 2, clear entire screen (and moves cursor to upper left on DOS ANSI.SYS). If n is 3, clear entire screen and delete all lines saved in the scrollback buffer (this feature was added for xterm and is supported by other terminal applications).
    CSI n K	        EL	        Erase in Line	                Erases part of the line. If n is 0 (or missing), clear from cursor to the end of the line. If n is 1, clear from cursor to beginning of the line. If n is 2, clear entire line. Cursor position does not change.
    CSI n S	        SU	        Scroll Up	                    Scroll whole page up by n (default 1) lines. New lines are added at the bottom. (not ANSI.SYS)
    CSI n T	        SD	        Scroll Down	                    Scroll whole page down by n (default 1) lines. New lines are added at the top. (not ANSI.SYS)
    CSI n ; m f	    HVP	        Horizontal Vertical Position	Same as CUP, but counts as a format effector function (like CR or LF) rather than an editor function (like CUD or CNL). This can lead to different handling in certain terminal modes.[5]: Annex A 
    CSI n m	        SGR	        Select Graphic Rendition	    Sets colors and style of the characters following this code
    CSI 5i		    AUX         Port On	                        Enable aux serial port usually for local serial printer
    CSI 4i		    AUX         Port Off	                    Disable aux serial port usually for local serial printer
    CSI 6n          DSR         Device Status Report            Reports the cursor position (CPR) by transmitting ESC[n;mR, where n is the row and m is the column.

---

    Some popular private sequences

    Code	        Abbr	        Name	                        Effect
    CSI s	        SCP, SCOSC	    Save Current Cursor Position	Saves the cursor position/state in SCO console mode.[18]
                                                                    In vertical split screen mode, instead used to set (as CSI n ; n s) or reset left and right margins.[19]
    CSI u	        RCP, SCORC	    Restore Saved Cursor Position	Restores the cursor position/state in SCO console mode.[20]
    CSI ? 25 h	    DECTCEM		                                    Shows the cursor, from the VT220.
    CSI ? 25 l	    DECTCEM		                                    Hides the cursor.
    CSI ? 1004 h			                                        Enable reporting focus.
                                                                    Reports whenever terminal emulator enters or exits focus as ESC [I and ESC [O, respectively.
    CSI ? 1004 l			                                        Disable reporting focus.
    CSI ? 1049 h			                                        Enable alternative screen buffer, from xterm
    CSI ? 1049 l			                                        Disable alternative screen buffer, from xterm
    CSI ? 2004 h			                                        Turn on bracketed paste mode.[21]
                                                                    In bracketed paste mode, text pasted into the terminal will be surrounded by ESC [200~ and ESC [201~; programs running in the terminal should not treat characters bracketed by those sequences as commands (Vim, for example, does not treat them as commands).[22] From xterm[23]
    CSI ? 2004 l			                                        Turn off bracketed paste mode.

[SGR (Select Graphic Rendition) parameters](https://en.wikipedia.org/w/index.php?title=ANSI_escape_code&action=edit&section=8)

    see doc

[Colors](https://en.wikipedia.org/w/index.php?title=ANSI_escape_code&action=edit&section=9)

    see doc

[3-bit and 4-bit](https://en.wikipedia.org/w/index.php?title=ANSI_escape_code&action=edit&section=10)

    see doc

[8 bit](https://en.wikipedia.org/w/index.php?title=ANSI_escape_code&action=edit&section=11)

> As [256-color](https://en.wikipedia.org/wiki/8-bit_color) lookup tables became common on graphic cards, escape sequences were added to select from a pre-defined set of 256 colors:[citation needed]

    ESC[38;5;⟨n⟩m           Select foreground color where n is a number from the table below
    ESC[48;5;⟨n⟩m           Select background color
        0- 7:               standard colors (as in ESC [ 30–37 m)
        8- 15:              high intensity colors (as in ESC [ 90–97 m)
    16-231:                 6 × 6 × 6 cube (216 colors): 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
    232-255:                grayscale from dark to light in 24 steps

> The ITU's T.416 Information technology - Open Document Architecture (ODA) and interchange format: Character content architectures[36] uses ":" as separator characters instead:

    ESC[38:5:⟨n⟩m           Select foreground color      where n is a number from the table below
    ESC[48:5:⟨n⟩m           Select background color

> 256-color mode — foreground: ESC[38;5;#m background: ESC[48;5;#m

![256-color mode](./img/256%20Color%20Mode.png '256 Color Mode')

#### Example

```ts
// control byte ^
const ctrl = '\x1B'
// escape ^[
const esc = '\x1B['

// hide cursor ^[? 25 l
const hide = '\x1B[?25l'
// show cursor ^[? 25 h
const show = '\x1B[?25h'
```
