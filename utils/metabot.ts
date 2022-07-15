import { AddressZ } from 'evm-translator'
import { createConnection, Model, Schema } from 'mongoose'

import { METABOT_DB_CONNECTION_STRING } from 'utils/constants'

type User = {
    address: string
    ens: string | null
    txHashList: string[]
}

type UserModelType = Model<User>

const UserSchema = new Schema<User, UserModelType>({
    address: { type: String, required: true, index: true, lowercase: true },
    ens: { type: String, required: false },
    txHashList: { type: [String], required: false },
})

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.metabotMongoose

if (!cached) {
    cached = global.metabotMongoose = { conn: null, promise: null }
}

export class MetabotMongoose {
    connectionString: string
    connected = false
    UserModel: UserModelType

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    async connect() {
        if (cached.conn) {
            this.connected = true
            return cached.conn
        }

        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
            }

            cached.promise = createConnection(METABOT_DB_CONNECTION_STRING, opts)
                .asPromise()
                .then((mongoose) => {
                    return mongoose
                })
        }
        cached.conn = await cached.promise
        cached.conn.model('User', UserSchema)
        this.connected = true
        return cached.conn
    }

    check(method: string) {
        if (!this.connected) {
            throw new Error(`Mongoose not connected to db: ${method}`)
        }
    }

    async disconnect() {
        if (!this.connected) return
        await this.connect()
        await cached.conn.close
        this.connected = false
    }

    async getUserByEthAddress(ethAddress: string): Promise<User | null> {
        await this.connect()
        try {
            const address = AddressZ.parse(ethAddress)
            const user = await cached.conn.models.User.findOne({ address })

            if (!user) return null

            const parsedUser = user.toObject()

            return parsedUser
        } catch (err) {
            console.error('mongoose getUserByEthAddress error', err)
            return null
        }
    }
}

export default new MetabotMongoose()
