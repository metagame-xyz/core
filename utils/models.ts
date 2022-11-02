import { AddressZ, int, string } from 'evm-translator'
import { Model, Schema } from 'mongoose'
import { z } from 'zod'

export const nftMetadataZ = z.object({
    project: string,
    name: string,
    description: string,
    image: string,
    externalUrl: string.optional(),
    tokenId: int.optional(),
    address: AddressZ,
    layers: z.record(string).optional(),
    extra: z.record(string).optional(),
    timestamp: z.string(),
})

export type NftMetadata = z.infer<typeof nftMetadataZ>

export type NftMetadataModelType = Model<NftMetadata>

export const NftMetadataSchema = new Schema<NftMetadata, NftMetadataModelType>({
    project: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    externalUrl: { type: String, required: false },
    tokenId: { type: Number, required: false, index: true },
    address: { type: String, required: true, index: true, lowercase: true },
    layers: { type: Object, required: false },
    extra: { type: Object, required: false },
    timestamp: { type: String, required: true },
})
