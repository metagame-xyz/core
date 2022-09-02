import { User, UserModel, userZ } from 'models/user'
import { AddressZ } from 'models/utils'
// import { MongoClient } from 'mongodb'
import { connect, Document, PipelineStage, Types } from 'mongoose'
import { z } from 'zod'

import { MONGOOSE_CONNECTION_STRING } from 'utils/constants'

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

            cached.promise = connect(MONGOOSE_CONNECTION_STRING, opts).then((mongoose) => {
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

    async getUserByMongoId(
        lastId: string,
        batchSize: number,
    ): Promise<(Document<unknown, any, User> & User & { _id: Types.ObjectId })[]> {
        await this.connect()
        try {
            const _id = new Types.ObjectId(lastId)
            const users = await UserModel.find({ _id: { $gt: _id } }).limit(batchSize)
            // console.log(user)

            return users
        } catch (err) {
            console.error('mongoose getUserByMongoId error', err)
            return null
        }
    }
    async getAllByTxCount(): Promise<any[]> {
        await this.connect()
        const agg: PipelineStage[] = [
            {
                $project: {
                    address: 1,
                    ens: 1,
                    twitterHandle: 1,
                    txs: {
                        $cond: {
                            if: {
                                $isArray: '$txHashList',
                            },
                            then: {
                                $size: '$txHashList',
                            },
                            else: 'NA',
                        },
                    },
                },
            },
            {
                $sort: {
                    txs: 1,
                },
            },
        ]

        try {
            // const _id = new Types.ObjectId(lastId)
            const users = await UserModel.aggregate(agg)
            // debugger
            // console.log(users[0])

            return users
        } catch (err) {
            console.error('mongoose getUserByMongoId error', err)
            return null
        }
    }

    async getUserByTelegramId(telegramId: number): Promise<User | null> {
        await this.connect()
        try {
            const user = await UserModel.findOne({ telegramId })

            // console.log(user)

            if (!user) return null

            const parsedUser = userZ.safeParse(user.toObject())

            if (!parsedUser.success) {
                console.error('Error', parsedUser)
                return null
            }

            return parsedUser.success ? parsedUser.data : null
        } catch (err) {
            console.error('mongoose getUserByTelegramId error', err)
            return null
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

    async getUserByEmail(email: string): Promise<User | null> {
        await this.connect()
        try {
            const user = await UserModel.findOne({ email })

            if (!user) return null

            const parsedUser = userZ.safeParse(user.toObject())

            if (!parsedUser.success) {
                console.error('Error', parsedUser)
                return null
            }

            return parsedUser.success ? parsedUser.data : null
        } catch (err) {
            console.error('mongoose getUserByEmail error', err)
            return null
        }
    }

    async addOrUpdateUser(user: User): Promise<User> {
        await this.connect()
        try {
            const filter = user.telegramId ? { telegramId: user.telegramId } : { address: user.address }
            const result = await UserModel.findOneAndUpdate(filter, user, {
                upsert: true,
                new: true,
            })

            return result.toObject()
        } catch (err) {
            console.error('mongoose addOrUpdateUser error', err)
        }
    }

    async addEmailToUser(email: string, ethAddress: string): Promise<boolean> {
        await this.connect()
        z.string().email().parse(email)
        const user = await this.getUserByEthAddress(ethAddress)
        if (!user) throw new Error('No user with the given eth address')

        if (!user.email) {
            user.email = email
            user.isEmailVerified = false
            await this.addOrUpdateUser(user)
        }

        return true
    }

    async addTxHashListToUsers(ethAddress: string, txHashList: string[]): Promise<User[]> {
        await this.connect()
        const users = await this.getUsersByEthAddress(ethAddress)
        if (!users.length) throw new Error('addTxHashListToUsers No user with the given eth address')

        for (const user of users) {
            user.txHashList = txHashList
            try {
                await this.addOrUpdateUser(user)
            } catch (err) {
                console.error('mongoose addTxHashListToUsers error', err)
                throw err
            }
        }
        return users
    }

    async addNomadWhitehat(ethAddress: string, txHashList: string[]): Promise<User[]> {
        await this.connect()
        const users = await this.getUsersByEthAddress(ethAddress)
        if (!users.length) {
            const newUser = userZ.parse({
                address: ethAddress,
                sources: ['Nomad_whitehat'],
                txHashList,
            })

            try {
                const result = await UserModel.findOneAndUpdate({ address: newUser.address }, newUser, {
                    upsert: true,
                    new: true,
                })

                return [result.toObject()]
            } catch (err) {
                console.error('mongoose addnomadwhitehat error', err)
            }
        }

        for (const user of users) {
            user.txHashList = txHashList
            if (!user.sources.includes('Nomad_whitehat')) {
                user.sources.push('Nomad_whitehat')
            }
            try {
                await this.addOrUpdateUser(user)
            } catch (err) {
                console.error('mongoose addTxHashListToUsers error', err)
                throw err
            }
        }
        return users
    }

    async addOrUpdateJobsCompletedArr(ethAddress: string, jobsCompletedArr: boolean[]): Promise<User[]> {
        await this.connect()
        const users = await this.getUsersByEthAddress(ethAddress)
        if (!users.length) throw new Error('addOrUpdateJobsCompletedArr No user with the given eth address')

        for (const user of users) {
            user.jobsCompletedArr = jobsCompletedArr
            try {
                await this.addOrUpdateUser(user)
            } catch (err) {
                console.error('mongoose addOrUpdateJobsCompletedArr error', err)
                throw err
            }
        }
        return users
    }

    async confirmEmailAddress(email: string, magicLinkId: string): Promise<void> {
        await this.connect()
        const user = await this.getUserByEmail(email)
        if (!user) throw new Error('User not found')

        user.isEmailVerified = true
        user.magicLinkId = magicLinkId
        await this.addOrUpdateUser(user)
    }
}

export default new Mongoose()
