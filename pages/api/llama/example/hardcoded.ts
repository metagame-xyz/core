import { UserData } from 'types'
import { IncomingLlamaUserData, LlamaTier } from 'types/llama'

export const llamaUserData: IncomingLlamaUserData = {
    id: 92,
    created_at: '2022-08-12T19:06:20.378726+00:00',
    username: 'garcia',
    // email: 'jerry@llama.xyz',
    tier: LlamaTier.Explorer,
    tier_by_season: {
        1: null,
        2: null,
        3: null,
        4: LlamaTier.Explorer,
    },
    eth_login_address: '0xeB9f74528aA4F9cA15612c68dC3eE944dF808611',
    admin: true,
}

export const userData: UserData = {
    minted: true,
    tokenId: 12,
    nftName: `austingreen.eth's Llama`,
    currentLayers: [
        { category: 'Background', name: '' },
        { category: 'Necklace', name: 'Green' },
    ],
}
