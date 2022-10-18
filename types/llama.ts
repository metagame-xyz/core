export const TierToLevel = {
    Traveler: 1,
    Explorer: 2,
    Mountaineer: 3,
    Rancher: 4,
}

export const enum LlamaTier {
    Traveler = 'Traveler',
    Explorer = 'Explorer',
    Mountaineer = 'Mountaineer',
    Rancher = 'Rancher',
}

export type IncomingLlamaUserData = {
    id: number
    created_at: string
    username: string
    tier: LlamaTier
    tier_by_season: Record<number, null | LlamaTier>
    eth_login_address: string
    admin: boolean
}
