interface Payload<T = any> {
    data?: T
    user_id: number
    session_id?: number
    created?: Date
    expires?: Date
}

interface ZVTokenOptions {
    secret: string
    structures?: string[]
    throwErrors?: boolean
}
