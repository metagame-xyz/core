import { createConnection } from 'mongoose'

import { LOGBOOK_DB_CONNECTION_STRING } from 'utils/constants'

import { NftMetadata, NftMetadataSchema, nftMetadataZ } from './models'


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.logbookMongoose

if (!cached) {
    cached = global.logbookMongoose = { conn: null, promise: null }
}

export class LogbookMongoose {
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

            cached.promise = createConnection(LOGBOOK_DB_CONNECTION_STRING, opts)
                .asPromise()
                .then((mongoose) => {
                    return mongoose
                })
        }
        cached.conn = await cached.promise
        cached.conn.model('NftMetadata', NftMetadataSchema)
        this.connected = true
        return cached.conn
    }

    check(method: string) {
        if (!this.connected) {
            throw new Error(`Mongoose not connected to db: ${method}`)
        }
    }

    async addOrUpdateNftMetadata(nftMetadata: NftMetadata): Promise<void> {
        await this.connect()
        try {
            const { address } = nftMetadata

            console.log('nftMetadata', nftMetadata)

            const existingData = await cached.conn.models.NftMetadata.findOne({ address })


            if (existingData?.tokenId) {
                nftMetadata.tokenId = existingData.tokenId
            }

            const result = await cached.conn.models.NftMetadata.findOneAndUpdate({ address }, nftMetadata, {
                upsert: true,
            })

            console.log('result', result)
        } catch (err) {
            console.error('mongoose addOrUpdateNftMetadata error', err)
        }
    }

    async addTokenIdForAddress(address: string, tokenId: number): Promise<NftMetadata> {
        await this.connect()
        try {
            const metadata = await cached.conn.models.NftMetadata.findOneAndUpdate(
                { address },
                { tokenId },
                { upsert: true },
            )

            return metadata.toObject()

        } catch (err) {
            console.error('mongoose addOrUpdateNftMetadata error', err)
        }
    }

    async getMetadataForAddress(address: string): Promise<NftMetadata | null> {
        await this.connect()
        try {
            const user = await cached.conn.models.NftMetadata.findOne({ address })

            console.log(user)

            if (!user) return null

            const parsedUser = nftMetadataZ.safeParse(user.toObject())

            if (!parsedUser.success) {
                console.error('Error', parsedUser)
                return null
            }

            return parsedUser.success ? parsedUser.data : null
        } catch (err) {
            console.error('mongoose getUserForAddress error', err)
            return null
        }
    }

    async getMetadataForTokenId(tokenId: string): Promise<NftMetadata | null> {
        await this.connect()
        try {
            const user = await cached.conn.models.NftMetadata.findOne({ tokenId })

            console.log(user)

            if (!user) return null

            const parsedUser = nftMetadataZ.safeParse(user.toObject())

            if (!parsedUser.success) {
                console.error('Error', parsedUser)
                return null
            }

            return parsedUser.success ? parsedUser.data : null
        } catch (err) {
            console.error('mongoose getUserForAddress error', err)
            return null
        }
    }
}

export default new LogbookMongoose()
