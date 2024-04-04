interface Payload<T = any> {
    data?: T
    user_id: number
    session_id?: number
    created_at?: Date
    expires_at?: Date
}