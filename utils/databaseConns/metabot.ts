import { User, UserModel, userZ } from 'models/metabotUser'
import { AddressZ } from 'models/utils'
import { connect } from 'mongoose'

import { METABOT_DB_CONNECTION_STRING } from 'utils/constants'

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

export class Mongoose {
    connectionString: string
    connected = false

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

            cached.promise = connect(METABOT_DB_CONNECTION_STRING, opts).then((mongoose) => {
                return mongoose
            })
        }
        cached.conn = await cached.promise
        this.connected = true
        return cached.conn
    }

    check(method: string) {
        if (!this.connected) {
            throw new Error(`Mongoose not connected to db: ${method}`)
        }
    }

    async getUserByEthAddress(ethAddress: string): Promise<User | null> {
        await this.connect()
        try {
            const address = AddressZ.parse(ethAddress)
            const user = await UserModel.findOne({ address })

            if (!user) return null

            const parsedUser = userZ.safeParse(user.toObject())

            if (!parsedUser.success) {
                console.error('Error', parsedUser)
                return null
            }

            return parsedUser.success ? parsedUser.data : null
        } catch (err) {
            console.error('mongoose getUserByEthAddress error', err)
            return null
        }
    }
    async getUsersByEthAddress(ethAddress: string): Promise<User[] | null> {
        await this.connect()
        try {
            const address = AddressZ.parse(ethAddress)
            const users = await UserModel.find({ address })

            if (!users.length) return []

            const parsedUsers = users.map((user) => userZ.safeParse(user.toObject()))

            const cleanUsers = [] as User[]
            for (const parsedUser of parsedUsers) {
                if (parsedUser.success) {
                    cleanUsers.push(parsedUser.data)
                } else {
                    console.error('Error', parsedUser)
                }
            }

            return cleanUsers
        } catch (err) {
            console.error('mongoose getUsersByEthAddress error', err)
            return null
        }
    }
    async getUsersByEthAddresses(ethAddresses: string[]): Promise<User[] | null> {
        await this.connect()
        try {
            const addresses = ethAddresses.map((a) => AddressZ.parse(a))
            const users = await UserModel.find({ address: { $in: addresses } })

            if (!users.length) return []

            const parsedUsers = users.map((user) => userZ.safeParse(user.toObject()))

            const cleanUsers = [] as User[]
            for (const parsedUser of parsedUsers) {
                if (parsedUser.success) {
                    cleanUsers.push(parsedUser.data)
                } else {
                    console.error('Error', parsedUser)
                }
            }

            return cleanUsers
        } catch (err) {
            console.error('mongoose getUsersByEthAddress error', err)
            return null
        }
    }
}

export default new Mongoose()
