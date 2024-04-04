import { Packr } from 'msgpackr'

interface ZVTokenOptions {
    secret: string
    structures?: string[]
    throwError?: boolean
}

class ZVToken {
    packr
    hasher
    secret
    throwError

    constructor (opts: ZVTokenOptions) {
        this.secret = opts.secret
        this.throwError = opts.throwError || false
        this.hasher = new Bun.CryptoHasher('sha256')

        this.packr = new Packr({
            structures: [[
                'user_id', 'session_id', 'created_at', 'expires_at', 'data',
                ...(opts.structures || [])
            ]]
        })
    }

    sign<T> (payload: Payload<T>) {
        const p = this.packr.pack(payload).toString('base64')

        this.hasher.update(p + this.secret)
        const sign = this.hasher.digest('base64')

        return `zv.${p}.${sign}`
            .replace(/\//g, '_')
            .replace(/\+/g, '-')
            .replace(/=/g, '')
    }

    error (msg: string) {
        if (this.throwError) throw new Error(msg)
        return { status: false, payload: undefined }
    }

    verify<T> (token: string) {
        const [, p, sign] = token
            .replace(/_/g, '/')
            .replace(/-/g, '+')
            .split('.')

        this.hasher.update(p + this.secret)
        const correctSign = this.hasher.digest('base64')
        if (sign !== correctSign.replace(/=/g, '')) {
            return this.error('incorrect sign')
        }

        const payload = this.packr.unpack(Buffer.from(p, 'base64')) as Payload<T>
        if (payload.expires_at && +new Date - +payload.expires_at > 0) {
            return this.error('session expired')
        }

        return { status: true, payload }
    }
}

export default ZVToken