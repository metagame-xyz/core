export type LayerItemRow = {
    project: string
    category: string
    modifiable: boolean
    name: string
    pngLink: string
    earnedDescription: string
    earnedCriteria: string | null
}

export type LayerItemData = {
    category: string
    name: string
    pngLink: string
    /** null means everyone can have this layer item */
    earned: boolean | null
    earnedDescription: string | null
}

export type CriteriaMap = Record<string, Record<string, (string) => any>>

export type AssetData = {
    category: string
    modifiable: boolean
    options: LayerItemData[]
}[]

export type UserData = {
    minted: boolean
    tokenId: number | null
    nftName: string | null
    currentLayers: { category: string; name: string }[]
}
