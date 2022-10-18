import type { NextApiRequest, NextApiResponse } from 'next'

import _ from 'lodash'

import { validateLlamaPfpAllowList } from 'api/premintCheck/checks/llama'

import { createDomainSeparator } from 'utils/premint'

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

const getMaxTier = (tiersBySeason: Record<number, LlamaTier>) => {
    const tiers = Object.values(tiersBySeason)
    const maxTier = tiers.reduce((acc: string, curr: string) => {
        if (tierToLevel[curr] > tierToLevel[acc]) {
            return curr
        }
        return acc
    }, 'Traveler') as string
    return maxTier
}

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

type LayerItemRow = {
    project: string
    category: string
    modifiable: boolean
    name: string
    pngLink: string
    earnedDescription: string
    earnedCriteria: string | null
}

const llamaBackgroundSparklyRow: LayerItemRow = {
    project: 'llama',
    category: 'background',
    modifiable: true,
    name: 'Sparkly',
    pngLink: 'https://llama-assets.s3.amazonaws.com/backgrounds/sparkly.png',
    earnedDescription: 'Earned by being a Traveler',
    earnedCriteria: 'Traveler',
}

const llamaBackgroundStarryRow: LayerItemRow = {
    project: 'llama',
    category: 'background',
    modifiable: true,
    name: 'Starry Night',
    pngLink: 'https://llama-assets.s3.amazonaws.com/backgrounds/starry.png',
    earnedDescription: 'Earned by being a Explorer',
    earnedCriteria: 'Explorer',
}

const llamaBodyBrownRow: LayerItemRow = {
    project: 'llama',
    category: 'body',
    modifiable: false,
    name: 'Brown',
    pngLink: 'https://llama-assets.s3.amazonaws.com/body/brown.png',
    earnedDescription: 'available to all',
    earnedCriteria: null,
}

const layersArr = [llamaBackgroundSparklyRow, llamaBackgroundStarryRow, llamaBodyBrownRow]

const llamaBackgroundCriteriaChecker = (criteriaRequirement: string) => (llamaUserData: IncomingLlamaUserData) => {
    const llamaLevel = tierToLevel[llamaUserData.tier]
    const criteriaLevel = tierToLevel[criteriaRequirement]
    return llamaLevel >= criteriaLevel
}

const llamaNecklaceCriteriaChecker = (criteriaRequirement: string) => (llamaUserData: IncomingLlamaUserData) => {
    const maxTier = getMaxTier(llamaUserData.tier_by_season)
    const maxTierLevel = tierToLevel[maxTier]
    const criteriaLevel = tierToLevel[criteriaRequirement]
    return maxTierLevel >= criteriaLevel
}

type CriteriaMap = Record<string, Record<string, (string) => any>>

const llamaCriteriaMap: CriteriaMap = {
    background: {
        Traveler: llamaBackgroundCriteriaChecker(LlamaTier.Traveler),
        Explorer: llamaBackgroundCriteriaChecker(LlamaTier.Explorer),
        Mountaineer: llamaBackgroundCriteriaChecker(LlamaTier.Mountaineer),
        Rancher: llamaBackgroundCriteriaChecker(LlamaTier.Rancher),
    },
    necklace: {
        Traveler: llamaNecklaceCriteriaChecker(LlamaTier.Traveler),
        Explorer: llamaNecklaceCriteriaChecker(LlamaTier.Explorer),
        Mountaineer: llamaNecklaceCriteriaChecker(LlamaTier.Mountaineer),
        Rancher: llamaNecklaceCriteriaChecker(LlamaTier.Rancher),
    },
}

type LayerItemData = {
    name: string
    pngLink: string
    earned: boolean
    earnedDescription: string
}

const layerItemRowToLayerItem = (
    layerItemRow: LayerItemRow,
    userData: IncomingLlamaUserData,
    criteriaMap: CriteriaMap,
): LayerItemData => {
    const { name, pngLink, earnedDescription, earnedCriteria, category } = layerItemRow

    return {
        name,
        pngLink,
        earnedDescription,
        earned: criteriaMap?.[category]?.[earnedCriteria]?.(userData) || null,
    }
}

type AssetData = {
    category: string
    modifiable: boolean
    options: LayerItemData[]
}[]

type UserData = {
    minted: boolean
    tokenId: number | null
    nftName: string | null
    currentLayers: { category: string; name: string }[]
}

const userData: UserData = {
    minted: true,
    tokenId: 12,
    nftName: `austingreen.eth's Llama`,
    currentLayers: [
        { category: 'Background', name: 'Sparkly' },
        { category: 'Necklace', name: 'Green' },
    ],
}

const assetData: AssetData = [
    {
        category: 'Background',
        modifiable: true,
        options: [
            {
                name: 'Sparkly',
                pngLink: 'https://llama-assets.s3.amazonaws.com/background/sparkly.png',
                earned: true,
                earnedDescription: 'Reach Traveler Tier',
            },
            {
                name: 'Starry Night',
                pngLink: 'https://llama-assets.s3.amazonaws.com/background/starry_night.png',
                earned: false,
                earnedDescription: 'Reach Explorer Tier',
            },
        ],
    },
    {
        category: 'Necklace',
        modifiable: true,
        options: [
            {
                name: 'Green',
                pngLink: 'https://llama-assets.s3.amazonaws.com/necklace/green.png',
                earned: true,
                earnedDescription: 'Reach Traveler Tier',
            },
            {
                name: 'Blue',
                pngLink: 'https://llama-assets.s3.amazonaws.com/necklace/blue.png',
                earned: false,
                earnedDescription: 'Reach Explorer Tier',
            },
        ],
    },
]

const layerItemRowsToAssetData = (
    layerRows: LayerItemRow[],
    userData: IncomingLlamaUserData,
    criteriaMap: CriteriaMap,
): AssetData => {
    // get all layer items for a project
    // group by category
    // loop through them all to get the earned status of each

    // group by category
    const layerRowsByCategoryMap = _(layerRows).groupBy('category')

    // filter keys, add earned boolean
    const assetData = layerRowsByCategoryMap.map((val, key) => ({
        category: key,
        modifiable: val[0].modifiable,
        options: val.map((obj) => layerItemRowToLayerItem(obj, userData, criteriaMap)),
    }))

    // console.log(layerRowsByCategoryMap);
    console.log(assetData)

    return assetData.value()
}

const testData = layerItemRowsToAssetData(layersArr, llamaUserData, llamaCriteriaMap)

console.log(testData)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const address = req.query.address as string
        const jwt = req.query.check as string

        const checkResponse = validateLlamaPfpAllowList(address, jwt)

        res.status(200).json(address)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}
