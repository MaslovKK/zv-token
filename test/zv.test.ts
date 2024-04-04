import ZVToken from 'index'
import { describe, it, expect } from 'bun:test'

const zv = new ZVToken({
    secret: String(Math.random() * 999999)
})

describe('zv-token', () => {
    let token: string,
        gotPayload: Payload

    const payload: Payload = {
        user_id: 123,
        session_id: 123
    }

    it('should make token', () => {
        token = zv.sign(payload)
        expect(token).toMatch(/^zv\.[\w-]+\.[\w-]+$/)
    })

    it('should verify token', () => {
        const data = zv.verify(token)
        expect(data.status).toBeTrue()
        gotPayload = data.payload!
    })

    it('should get correct payload', () => {
        expect(gotPayload.user_id).toBe(payload.user_id)
        expect(+gotPayload.created! - +payload.created!).toBe(0)
    })
})