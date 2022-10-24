import type { NextApiRequest, NextApiResponse } from 'next'

import { AddressZ } from 'evm-translator'
import _ from 'lodash'
import { AssetData, CriteriaMap, LayerItemData, LayerItemRow, UserData } from 'types'
import { IncomingLlamaUserData, LlamaTier, TierToLevel } from 'types/llama'

import { validateLlamaPfpAllowList } from 'api/premintCheck/checks/llama'

import { fetcher } from 'utils/requests'

import { allRows } from './assetData'

const token = ''

const getMaxTier = (tiersBySeason: Record<number, LlamaTier>) => {
    const tiers = Object.values(tiersBySeason)
    const maxTier = tiers.reduce((acc: string, curr: string) => {
        if (TierToLevel[curr] > TierToLevel[acc]) {
            return curr
        }
        return acc
    }, 'Traveler') as string
    return maxTier
}

const llamaBackgroundCriteriaChecker = (criteriaRequirement: string) => (llamaUserData: IncomingLlamaUserData) => {
    const llamaLevel = TierToLevel[llamaUserData.tier]
    const criteriaLevel = TierToLevel[criteriaRequirement]
    return llamaLevel >= criteriaLevel
}

const llamaNecklaceCriteriaChecker = (criteriaRequirement: string) => (llamaUserData: IncomingLlamaUserData) => {
    const maxTier = getMaxTier(llamaUserData.tier_by_season)
    const maxTierLevel = TierToLevel[maxTier]
    const criteriaLevel = TierToLevel[criteriaRequirement]
    return maxTierLevel >= criteriaLevel
}

const llamaCriteriaMap: CriteriaMap = {
    Background: {
        Traveler: llamaBackgroundCriteriaChecker(LlamaTier.Traveler),
        Explorer: llamaBackgroundCriteriaChecker(LlamaTier.Explorer),
        Mountaineer: llamaBackgroundCriteriaChecker(LlamaTier.Mountaineer),
        Rancher: llamaBackgroundCriteriaChecker(LlamaTier.Rancher),
    },
    Necklace: {
        Traveler: llamaNecklaceCriteriaChecker(LlamaTier.Traveler),
        Explorer: llamaNecklaceCriteriaChecker(LlamaTier.Explorer),
        Mountaineer: llamaNecklaceCriteriaChecker(LlamaTier.Mountaineer),
        Rancher: llamaNecklaceCriteriaChecker(LlamaTier.Rancher),
    },
}

const layerItemRowToLayerItem = (
    layerItemRow: LayerItemRow,
    userData: IncomingLlamaUserData,
    criteriaMap: CriteriaMap,
): LayerItemData => {
    const { name, pngLink, earnedDescription, earnedCriteria, category } = layerItemRow

    // if (category === 'Background') {
    //     console.log(earnedCriteria)
    //     console.log(criteriaMap?.[category]?.[earnedCriteria]?.(userData))
    // }
    return {
        name,
        pngLink,
        earnedDescription,
        earned: criteriaMap?.[category]?.[earnedCriteria]?.(userData) ?? null,
    }
}

const layerItemRowsToAssetData = (
    layerRows: LayerItemRow[],
    userData: IncomingLlamaUserData,
    criteriaMap: CriteriaMap,
): AssetData => {
    // loop through them all to get the earned status of each

    // group by category
    const layerRowsByCategoryMap = _(layerRows).groupBy('category')

    // filter keys, add earned boolean
    const assetData = layerRowsByCategoryMap.map((val, key) => ({
        category: key,
        modifiable: val[0].modifiable,
        options: val.map((obj) => layerItemRowToLayerItem(obj, userData, criteriaMap)),
    }))

    return assetData.value()
}

const llamaUsersBaseUrl = 'https://community.llama.xyz/api/users/'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // const address = req.query.address as string
        const authToken = req.query.jwt || (token as string)
        const llamaUserId = req.query.llamaUserId as string

        let llamaData = null
        try {
            llamaData = (
                await fetcher(llamaUsersBaseUrl + llamaUserId, {
                    headers: { authorization: `Bearer ${authToken}` },
                })
            ).body

            console.log('llamaData', llamaData)
        } catch (e) {
            if (e.status === 401) {
                return res.status(401).json({ error: 'Unauthorized' })
            } else {
                console.log('Error!')
                console.log(e.status)
            }
        }

        if (!llamaData) {
            return res.status(404).json({ error: 'Llama user not found' })
        }

        console.log('llamaData', llamaData)

        const parseData = AddressZ.safeParse(llamaData.eth_login_address)
        const address = parseData.success ? parseData.data : null

        const testData = layerItemRowsToAssetData(allRows, llamaData, llamaCriteriaMap)
        const checkResponse = await validateLlamaPfpAllowList(address)

        // TODO: get this from the Metatgame database
        // const userData: UserData = {

        return res.status(200).json({ assetData: testData, checkResponse })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
}
