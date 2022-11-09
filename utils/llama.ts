import _ from 'lodash'
import { AssetData, CriteriaMap, LayerItemData, LayerItemRow } from 'types'
import { IncomingLlamaUserData, LlamaTier, TierToLevel } from 'types/llama'

import { fetcher } from './requests'

const llamaUsersBaseUrl = 'https://community.llama.xyz/api/users/'
export const LLAMA_PROJECT_NAME = 'llamaPfp'

export const getLlamaUserData = async (userId: string, authToken: string): Promise<IncomingLlamaUserData> => {
    const data = (
        await fetcher(llamaUsersBaseUrl + userId, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
    ).body as IncomingLlamaUserData

    return data
}

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

export const llamaCriteriaMap: CriteriaMap = {
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
        category,
        pngLink,
        earnedDescription,
        earned: criteriaMap?.[category]?.[earnedCriteria]?.(userData) ?? null,
    }
}

export const layerItemRowsToAssetData = (
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
        zIndex: val[0].zIndex,
        modifiable: val[0].modifiable,
        options: val.map((obj) => layerItemRowToLayerItem(obj, userData, criteriaMap)),
    }))

    return assetData.value()
}
