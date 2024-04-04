## ZV Token
ZVT is more modern (as I think) alternative for JWT. It works with MsgPack instead of JSON, which makes it 1.5-2x smaller and 1.5x faster.

### Usage

```ts
import ZVToken from 'zv-token'

const zv = new ZVToken({
    secret: 'jwt is gay',
    
    // keys that u use in payload.data
    structures: ['scope'],
    
    // pass true if u want to get
    // error instead of { status: false } 
    throwErrors: false // default
})

const token = zv.sign({
    user_id: 123,
    session_id: 123,
    expires_at: new Date(2147483647000),
    data: {
        // any other payload
        scope: 'read, write'
    }
})

console.log('token:', token)

const data = zv.verify(token)
console.log(data) 

// { 
//    status: true | false,
//    payload: {
//        user_id: 123,
//        session_id: 123,
//        expires_at: Tue Jan 19 2038 06:14:07,
//        data: { your payload }
//    }
// }
```