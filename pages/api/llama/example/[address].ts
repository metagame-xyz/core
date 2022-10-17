import type { NextApiRequest, NextApiResponse } from 'next'

import _ from 'lodash'

import { CheckResponse } from 'utils/premint'

const defaultAvatarUrl = `https://community.llama.xyz/assets/default-avatar.png`

const tierToLevel = {
    Traveler: 1,
    Explorer: 2,
    Mountaineer: 3,
    Rancher: 4,
}

const enum LlamaTier {
    Traveler = 'Traveler',
    Explorer = 'Explorer',
    Mountaineer = 'Mountaineer',
    Rancher = 'Rancher',
}

/**
 * This is the shape of the data we'd like to receive from Llama's backend.
 * The only thing that's missing right now is the tier_by_season object. Could you please add the tier_by_season object?
 */

type IncomingLlamaUserData = {
    id: number
    created_at: string
    username: string
    tier: LlamaTier
    tier_by_season: Record<number, null | LlamaTier>
    eth_login_address: string
    admin: boolean
}

const llamaUserData: IncomingLlamaUserData = {
    id: 92,
    created_at: '2022-08-12T19:06:20.378726+00:00',
    username: 'garcia',
    // email: 'jerry@llama.xyz',
    tier: LlamaTier.Traveler,
    tier_by_season: {
        1: null,
        2: null,
        3: null,
        4: LlamaTier.Traveler,
    },
    eth_login_address: '0xeB9f74528aA4F9cA15612c68dC3eE944dF808611',
    admin: true,
}

// How it will be stored in the Metagame db
type LayerItemRow = {
    project: string
    category: string
    modifiable: boolean
    name: string
    pngLink: string
    earnedDescription: string
    earnedCriteria: string | null
}

/**
 * This is the GET API you'll hit to get all the data:
 * core.theMetagame.xyz/api/llama/example/0xA17F...BC94?jwt=123abc
 *
 * The address in the URL is the address of the user
 * The jwt in the query params is from Llama's auth system. It has to be passed to us so we can access Llama's backend from our backend
 *
 * Below is the shape of the data you'll be receiving back, and an example of the data.
 */

// included here for convenience. We access this type from a different file
//  type CheckResponse = {
//     valid: boolean
//     signature: ethers.Signature | null
//     data?: any
// }

type UserData = {
    minted: boolean
    tokenId: number | null
    nftName: string | null
    currentLayers: { category: string; name: string }[]
}

type LayerItemData = {
    name: string
    pngLink: string
    earned: boolean | null
    earnedDescription: string
}

type AssetData = {
    category: string
    modifiable: boolean
    options: LayerItemData[]
}[]

type Response = {
    /** signature used to pass to the contract to mint*/
    checkResponse: CheckResponse
    /** used to display an existing pfp, and mint vs update logic */
    userData: UserData
    /** used to show all the layer options and which ones the user can use */
    assetData: AssetData
}

const userData: UserData = {
    minted: true,
    tokenId: 12,
    nftName: `austingreen.eth's Llama`,
    currentLayers: [
        { category: 'Background', name: 'Sparkly' },
        { category: 'Necklace', name: 'Green' },
        { category: 'Body', name: 'Brown' },
        { category: 'Mouth Accessory', name: 'Nose Ring' },
        { category: 'Glasses', name: 'Purple Flat Glasses' },
        { category: 'ears', name: 'Purple Headset' },
        { category: 'eyes', name: 'Open' },
    ],
}

const assetData: AssetData = [
    {
        category: 'Background',
        modifiable: true,
        options: [
            {
                name: 'Blue - Green',
                pngLink: defaultAvatarUrl,
                earned: true,
                earnedDescription: 'Reach Traveler Tier',
            },
            {
                name: 'Green - Blue',
                pngLink: defaultAvatarUrl,
                earned: true,
                earnedDescription: 'Reach Explorer Tier',
            },
            {
                name: 'Green',
                pngLink: defaultAvatarUrl,
                earned: true,
                earnedDescription: 'Reach Explorer Tier',
            },
            {
                name: 'Pink',
                pngLink: defaultAvatarUrl,
                earned: false,
                earnedDescription: 'Reach Mountaineer Tier',
            },
            {
                name: 'Blue - Pink - Orange',
                pngLink: defaultAvatarUrl,
                earned: false,
                earnedDescription: 'Reach Mountaineer Tier',
            },
            {
                name: 'Shooting Stars',
                pngLink: defaultAvatarUrl,
                earned: false,
                earnedDescription: 'Reach Rancher Tier',
            },
            {
                name: 'Sparkly',
                pngLink: defaultAvatarUrl,
                earned: false,
                earnedDescription: 'Reach Rancher Tier',
            },
        ],
    },
    {
        category: 'Body',
        modifiable: false,
        options: [
            {
                name: 'Black',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
            {
                name: 'Brown',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
            {
                name: 'Brown with Mane',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
            {
                name: 'Cream with Mane',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
            {
                name: 'Brown with Spots',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
            {
                name: 'Cream with Spots',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
            {
                name: 'Unkempt',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
            {
                name: 'Cream',
                pngLink: defaultAvatarUrl,
                earnedDescription: 'Available to all',
                earned: null,
            },
        ],
    },
    {
        category: 'Necklace',
        modifiable: true,
        options: [
            {
                name: 'Green',
                pngLink: defaultAvatarUrl,
                earned: true,
                earnedDescription: 'Reach Traveler Tier',
            },
            {
                name: 'Blue',
                pngLink: defaultAvatarUrl,
                earned: false,
                earnedDescription: 'Reach Explorer Tier',
            },
        ],
    },
    {
        category: 'Mouth Accessory',
        modifiable: true,
        options: [
            {
                name: 'Nose Ring',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Blue',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
        ],
    },
    {
        category: 'Glasses',
        modifiable: true,
        options: [
            {
                name: 'Blue Hexagon Glasses',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Purple Flat Glasses',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
        ],
    },
    {
        category: 'Ears',
        modifiable: true,
        options: [
            {
                name: 'Yellow Headset',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Purple Headset',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
        ],
    },
    {
        category: 'Eyes',
        modifiable: false,
        options: [
            {
                name: 'Squinty',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Slanted Down',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Slanted Up',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Closed Down',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Closed Up',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
            {
                name: 'Open',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: 'Available to all',
            },
        ],
    },
]

const checkResponse: CheckResponse = {
    valid: true,
    signature: null, // TODO add real sig
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const address = req.query.address as string
        const jwt = req.query.address as string

        const returnData: Response = {
            userData,
            assetData,
            checkResponse,
        }

        res.status(200).json(returnData)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}
