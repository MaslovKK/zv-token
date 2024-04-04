import { Packr } from 'msgpackr'

interface ZVTokenOptions {
    secret: string
    structures?: string[]
    throwErrors?: boolean
}

class ZVToken {
    packr
    hasher
    secret
    throwErrors

    constructor (opts: ZVTokenOptions) {
        this.secret = opts.secret
        this.throwErrors = opts.throwErrors || false
        this.hasher = new Bun.CryptoHasher('sha256')

        this.packr = new Packr({
            structures: [[
                'user_id', 'session_id', 'created', 'expires', 'data',
                ...(opts.structures || [])
            ]]
        })
    }

    sign<T> (payload: Payload<T>) {
        payload.created ??= new Date
        const p = this.packr.pack(payload)
            .toString('base64')

        this.hasher.update(p + this.secret)
        const sign = this.hasher.digest('base64')

        return `zv.${p}.${sign}`
            .replace(/\//g, '_')
            .replace(/\+/g, '-')
            .replace(/=/g, '')
    }

    error (msg: string) {
        if (this.throwErrors) throw new Error(msg)
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
        if (payload.expires && +new Date - +payload.expires > 0) {
            return this.error('session expired')
        }

        return { status: true, payload }
    }
}

export default ZVToken