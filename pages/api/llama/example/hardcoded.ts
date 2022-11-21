import { UserData } from 'types'
import { IncomingLlamaUserData, LlamaTier } from 'types/llama'

export const devBrenner: IncomingLlamaUserData = {
    id: 92,
    created_at: '2022-08-12T19:06:20.378726+00:00',
    username: 'devBrenner',
    tier: LlamaTier.Mountaineer,
    tier_by_season: {
        1: null,
        2: null,
        3: null,
        4: LlamaTier.Mountaineer,
    },
    eth_login_address: '0x7d0414B0622f485D0368602E76F502CabEf57bf4',
    admin: true,
}

export const devLlamaUsers: Record<string, IncomingLlamaUserData> = {
    '0x7d0414B0622f485D0368602E76F502CabEf57bf4': devBrenner,
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
