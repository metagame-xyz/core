import mongoose, { createConnection } from 'mongoose'

import { LOGBOOK_DB_CONNECTION_STRING } from 'utils/constants'

import { NftMetadata, NftMetadataSchema  } from './models'

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
            const existingData = await cached.conn.models.NftMetadata.findOne({ address })

            debugger

            if (existingData?.tokenId) {
                nftMetadata.tokenId = existingData.tokenId
            }

            await cached.conn.models.NftMetadata.findOneAndUpdate({ address }, nftMetadata, { upsert: true })
        } catch (err) {
            console.error('mongoose addOrUpdateNftMetadata error', err)
        }
    }

    async addTokenIdForAddress(address: string, tokenId: number): Promise<void> {
        await this.connect()
        try {
            console.log('address', address, tokenId)
            const data = await cached.conn.models.NftMetadata.findOne({ address })

            console.log(data)
            let count = await cached.conn.models.NftMetadata.countDocuments()
            console.log(count)

            await cached.conn.models.NftMetadata.findOneAndUpdate({ address }, { tokenId }, { upsert: true })
            count = await cached.conn.models.NftMetadata.countDocuments()
            console.log(count)
        } catch (err) {
            console.error('mongoose addOrUpdateNftMetadata error', err)
        }
    }

    
}

export default new LogbookMongoose()
