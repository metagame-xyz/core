import type { NextApiRequest, NextApiResponse } from 'next'

import _ from 'lodash'
import { LlamaTier } from 'types/llama'

import { CheckResponse } from 'utils/premint'

const defaultAvatarUrl = `https://community.llama.xyz/assets/default-avatar.png`

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
    earnedDescription: string | null
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
    /** null means everyone can have this layer item */
    earned: boolean | null
    earnedDescription: string | null
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
                earnedDescription: null,
                earned: null,
            },
            {
                name: 'Brown',
                pngLink: defaultAvatarUrl,
                earnedDescription: null,
                earned: null,
            },
            {
                name: 'Brown with Mane',
                pngLink: defaultAvatarUrl,
                earnedDescription: null,
                earned: null,
            },
            {
                name: 'Cream with Mane',
                pngLink: defaultAvatarUrl,
                earnedDescription: null,
                earned: null,
            },
            {
                name: 'Brown with Spots',
                pngLink: defaultAvatarUrl,
                earnedDescription: null,
                earned: null,
            },
            {
                name: 'Cream with Spots',
                pngLink: defaultAvatarUrl,
                earnedDescription: null,
                earned: null,
            },
            {
                name: 'Unkempt',
                pngLink: defaultAvatarUrl,
                earnedDescription: null,
                earned: null,
            },
            {
                name: 'Cream',
                pngLink: defaultAvatarUrl,
                earnedDescription: null,
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
                earnedDescription: null,
            },
            {
                name: 'Blue',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
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
                earnedDescription: null,
            },
            {
                name: 'Purple Flat Glasses',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
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
                earnedDescription: null,
            },
            {
                name: 'Purple Headset',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
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
                earnedDescription: null,
            },
            {
                name: 'Slanted Down',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
            },
            {
                name: 'Slanted Up',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
            },
            {
                name: 'Closed Down',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
            },
            {
                name: 'Closed Up',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
            },
            {
                name: 'Open',
                pngLink: defaultAvatarUrl,
                earned: null,
                earnedDescription: null,
            },
        ],
    },
]

const checkResponse: CheckResponse = {
    valid: true,
    signature: {
        r: '0xa68e6a53467ff7ca037d7b376b714e85a6259ce77c2681e0f9b7a284d5292133',
        s: '0x503d3dfc7f2105ed6477f840bcac2a6526c2e745411f6aea24092c89337ab8f8',
        _vs: '0x503d3dfc7f2105ed6477f840bcac2a6526c2e745411f6aea24092c89337ab8f8',
        recoveryParam: 0,
        v: 27,
        yParityAndS: '0x503d3dfc7f2105ed6477f840bcac2a6526c2e745411f6aea24092c89337ab8f8',
        compact:
            '0xa68e6a53467ff7ca037d7b376b714e85a6259ce77c2681e0f9b7a284d5292133503d3dfc7f2105ed6477f840bcac2a6526c2e745411f6aea24092c89337ab8f8',
    },
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
