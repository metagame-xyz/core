import { model, Model, models, Schema } from 'mongoose'
import { z } from 'zod'

import { AddressZ, string } from './utils'

export const userZ = z.object({
    address: AddressZ.optional(),
    txHashList: string.array().optional(),
})

export type User = z.infer<typeof userZ>

type UserModelType = Model<User>

const UserSchema = new Schema<User, UserModelType>({
    address: { type: String, required: false, index: true, lowercase: true },
    txHashList: { type: [String], required: false },
})

export const UserModel = (models.User as UserModelType) || model<User, UserModelType>('User', UserSchema)
