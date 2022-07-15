import { AddressZ, int, string } from 'evm-translator'
import { model, Model, models, Schema } from 'mongoose'
import { z } from 'zod'

export const nftMetadataZ = z.object({
    name: string,
    description: string,
    image: string,
    externalUrl: string,
    tokenId: int.optional(),
    address: AddressZ,
    sentences: string.array(),
})

export type NftMetadata = z.infer<typeof nftMetadataZ>

export type NftMetadataModelType = Model<NftMetadata>

export const NftMetadataSchema = new Schema<NftMetadata, NftMetadataModelType>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    externalUrl: { type: String, required: true },
    tokenId: { type: Number, required: false, index: true },
    address: { type: String, required: true, index: true, lowercase: true },
    sentences: { type: [String], required: true },
})
