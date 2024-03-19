import { WindowSize } from '../types'

interface SystemEvent {
    type: 'system'
    data: WindowSize
}

interface TimerEvent {
    type: 'timer'
    data: number
}

export type Event = SystemEvent | TimerEvent

/**
 * Maps events to a union of their types.
 *
 * Interpretation
 *   - [K in keyof Event]: Event[K] crates a type where the proprties are unionized.
 *   - ['type'] pulls the type union off of the mapped type
 */
export type EventType = { [K in keyof Event]: Event[K] }['type']

/**
 * Maps events to their data type for a given EventType
 *
 * Interpretaion:
 *   - [T in Event as T['type']] creates a union of events which can be discriminated based on type
 *   - :T['data'] maps these to the 'data' key union
 *   - [K] selects the one that matches T['type']
 */
export type EventData<K extends EventType> = { [T in Event as T['type']]: T['data'] }[K]
