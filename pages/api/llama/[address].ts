import type { NextApiRequest, NextApiResponse } from 'next'

import { ethers } from 'ethers'

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

type LayerItemDbRow = {
    project: string
    category: string
    name: string
    pngLink: string
    earnedDescription: string
    earnedCriteria: string
}

const llamaBackgroundSparklyDbRow: LayerItemDbRow = {
    project: 'llama',
    category: 'background',
    name: 'Sparkly',
    pngLink: 'https://llama-assets.s3.amazonaws.com/backgrounds/sparkly.png',
    earnedDescription: 'Earned by being a Traveler',
    earnedCriteria: 'traveler',
}

const llamaUserDataCriteriaCheckGenerator = (criteriaRequirement: string) => (llamaUserData: IncomingLlamaUserData) => {
    const llamaLevel = tierToLevel[llamaUserData.tier]
    const criteriaLevel = tierToLevel[criteriaRequirement]
    return llamaLevel >= criteriaLevel
}

const llamaCriteriaMap = {
    traveler: llamaUserDataCriteriaCheckGenerator(LlamaTier.Traveler),
    explorer: llamaUserDataCriteriaCheckGenerator(LlamaTier.Explorer),
    mountaineer: llamaUserDataCriteriaCheckGenerator(LlamaTier.Mountaineer),
    rancher: llamaUserDataCriteriaCheckGenerator(LlamaTier.Rancher),
}

type LayerItemData = {
    name: string
    pngLink: string
    earned: boolean
    earnedDescription: string
}

const layerItemDbToLayerItem = (
    layerItemDbRow: LayerItemDbRow,
    userData: IncomingLlamaUserData,
    criteriaMap: Record<string, (string) => any>,
): LayerItemData => {
    const { name, pngLink, earnedDescription, earnedCriteria } = layerItemDbRow
    return {
        name,
        pngLink,
        earnedDescription,
        earned: criteriaMap[earnedCriteria](userData),
    }
}

// get all layer items for a project
// group by category
// loop through them all to get the earned status of each

type AssetData = {
    category: string
    options: LayerItemData[]
}[]

const assetData: AssetData = [
    {
        category: 'Background',
        options: [
            {
                name: 'Sparkly',
                pngLink: 'https://llama-assets.s3.amazonaws.com/backgrounds/sparkly.png',
                earned: true,
                earnedDescription: 'Reach Traveler Tier',
            },
            {
                name: 'Starry Night',
                pngLink: 'https://llama-assets.s3.amazonaws.com/backgrounds/starry_night.png',
                earned: false,
                earnedDescription: 'Reach Explorer Tier',
            },
        ],
    },
]

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const address = req.query.address as string
        const check = req.query.check as string

        res.status(200).json(address)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}
