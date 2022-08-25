import { model, Model, models, Schema } from 'mongoose'
import { z } from 'zod'

import { AddressZ, boolean, int, string } from './utils'

export const userZ = z.object({
    telegramId: int.optional(),
    telegramHandle: string.optional(),
    twitterId: int.optional(),
    twitterHandle: string.optional(),
    address: AddressZ.optional(),
    ens: string.optional(),
    telegramFirstName: string.optional(),
    twitterUsername: string.optional(),
    email: string.email().optional(),
    isEmailVerified: boolean.optional(),
    magicLinkId: string.optional(),

    txHashList: string.array().optional(),
    jobsCompletedArr: boolean.nullable().array().optional(),
    sources: string.array().optional(),

    isMetabotEnabled: boolean.default(true),
})

export type User = z.infer<typeof userZ>

type UserModelType = Model<User>

const UserSchema = new Schema<User, UserModelType>({
    telegramId: { type: Number, required: false, sparse: true },
    telegramHandle: { type: String, required: false },
    twitterId: { type: Number, required: false },
    twitterHandle: { type: String, required: false },
    address: { type: String, required: false, index: true, lowercase: true },
    ens: { type: String, required: false },
    telegramFirstName: { type: String, required: false },
    twitterUsername: { type: String, required: false },
    isMetabotEnabled: { type: Boolean, required: true },
    email: { type: String, required: false },
    isEmailVerified: { type: Boolean, required: false },
    magicLinkId: { type: String, required: false },
    txHashList: { type: [String], required: false },
    jobsCompletedArr: { type: [Boolean], required: false },
    sources: { type: [String], required: true },
})

export const UserModel = (models.User as UserModelType) || model<User, UserModelType>('User', UserSchema)
