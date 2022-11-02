import { AddressZ } from 'evm-translator'
import { createConnection } from 'mongoose'

import { NFT_METADATA_CONNECTION_STRING } from 'utils/constants'

import { NftMetadata, NftMetadataModelType, NftMetadataSchema } from './models'

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.nftMongoose

if (!cached) {
    cached = global.nftMongoose = { conn: null, promise: null }
}

export class NftMongoose {
    connectionString: string
    connected = false
    NftMetadataModel: NftMetadataModelType

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

            cached.promise = createConnection(NFT_METADATA_CONNECTION_STRING, opts)
                .asPromise()
                .then((mongoose) => {
                    return mongoose
                })
        }
        cached.conn = await cached.promise
        this.NftMetadataModel = cached.conn.model('Metadata', NftMetadataSchema, 'metadata')
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

    async getAllNftMetadataByProject(project: string): Promise<NftMetadata[]> {
        await this.connect()
        try {
            // get most recent metadata for each address
            const nftMetadataArr = await cached.conn.models.Metadata.aggregate([
                { $match: { project } },
                { $sort: { timestamp: -1 } },
                {
                    $group: {
                        _id: '$address',
                        address: { $first: '$address' },
                        name: { $first: '$name' },
                        tokenId: { $first: '$tokenId' },
                        description: { $first: '$description' },
                        image: { $first: '$image' },
                        externalUrl: { $first: '$externalUrl' },
                        layers: { $first: '$layers' },
                        extra: { $first: '$extra' },
                        timestamp: { $first: '$timestamp' },
                    },
                },
                { $project: { _id: 0 } },
            ])

            return nftMetadataArr || []

            // console.log('nftMetadataArr', nftMetadataArr)

            // const parsedNftMetadataArr = nftMetadataArr.map((data) => data.toObject()) as NftMetadata[]

            // return parsedNftMetadataArr
        } catch (err) {
            console.error('mongoose getAllNftMetadataByProject error', err)
            return []
        }
    }
    async getNftMetadataByProjectAndEthAddress(project: string, ethAddress: string): Promise<NftMetadata | null> {
        await this.connect()
        try {
            const address = AddressZ.parse(ethAddress)
            const nftMetadata = await cached.conn.models.Metadata.findOne({ project, address }).sort({
                timestamp: -1,
            })

            if (!nftMetadata) return null

            const parsedMetadata = nftMetadata.toObject()

            return parsedMetadata
        } catch (err) {
            console.error('mongoose getNftMetadataByProjectAndEthAddress error', err)
            return null
        }
    }

    async createNftMetadata(nftMetadata: NftMetadata): Promise<NftMetadata | null> {
        await this.connect()
        try {
            const nftMetadataModel = cached.conn.models.Metadata(nftMetadata)
            const savedNftMetadata = await nftMetadataModel.save()

            if (!savedNftMetadata) return null

            const parsedMetadata = savedNftMetadata.toObject()

            return parsedMetadata
        } catch (err) {
            console.error('mongoose createNftMetadata error', err)
            return null
        }
    }
}

export default new NftMongoose()
