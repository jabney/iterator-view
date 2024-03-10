type KeyValuePairs = { [key: string]: any }

export const createOptions = <T extends KeyValuePairs>(defaults: T) => {
    return (options?: Partial<T>): T => ({ ...defaults, ...options })
}
