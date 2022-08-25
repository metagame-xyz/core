import { z } from 'zod'

export const addressRegex = new RegExp(/^0x[a-fA-F0-9]{40}$/)
export const toLowercaseFn = (x: string) => x.toLowerCase()
export const number = z.number()

export const AddressZ = z.string().regex(addressRegex).transform(toLowercaseFn)
export const int = z.number().int()
export const nullableInt = number.int().nullable()
export const string = z.string()
export const boolean = z.boolean()
