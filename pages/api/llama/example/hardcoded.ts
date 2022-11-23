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
    eth_login_address: '0x7d0414b0622f485d0368602e76f502cabef57bf4',
    admin: true,
}
export const metagame: IncomingLlamaUserData = {
    id: 97,
    created_at: '2022-08-12T19:06:20.378726+00:00',
    username: 'metagame',
    tier: LlamaTier.Mountaineer,
    tier_by_season: {
        1: null,
        2: null,
        3: null,
        4: LlamaTier.Mountaineer,
    },
    eth_login_address: '0x5c87a0d45f8c0eb4e596ffd03d4d970ba1c76d40',
    admin: true,
}
export const anotherDev: IncomingLlamaUserData = {
    id: 94,
    created_at: '2022-08-12T19:06:20.378726+00:00',
    username: 'another Dev',
    tier: LlamaTier.Mountaineer,
    tier_by_season: {
        1: null,
        2: null,
        3: null,
        4: LlamaTier.Mountaineer,
    },
    eth_login_address: '0x001cf1faa42b18021c90a29e622e83fffe2be6ce',
    admin: true,
}

export const realMetagame: IncomingLlamaUserData = {
    id: 94,
    created_at: '2022-08-12T19:06:20.378726+00:00',
    username: 'real Metagame',
    tier: LlamaTier.Mountaineer,
    tier_by_season: {
        1: null,
        2: null,
        3: null,
        4: LlamaTier.Mountaineer,
    },
    eth_login_address: '0x902a37155438982884ca26a5dbccf73f5ae8194b',
    admin: true,
}
export const anotherAccount: IncomingLlamaUserData = {
    id: 901,
    created_at: '2022-08-12T19:06:20.378726+00:00',
    username: 'another account',
    tier: LlamaTier.Mountaineer,
    tier_by_season: {
        1: null,
        2: null,
        3: null,
        4: LlamaTier.Mountaineer,
    },
    eth_login_address: '0xe3d6f81232249c195b5b361c3db84e08a79a9ea4',
    admin: true,
}

export const devLlamaUsers: Record<string, IncomingLlamaUserData> = {
    '0x7d0414b0622f485d0368602e76f502cabef57bf4': devBrenner,
    '0x5c87a0d45f8c0eb4e596ffd03d4d970ba1c76d40': metagame,
    '0x001cf1faa42b18021c90a29e622e83fffe2be6ce': anotherDev,
    '0x902a37155438982884ca26a5dbccf73f5ae8194b': realMetagame,
    '0xe3d6f81232249c195b5b361c3db84e08a79a9ea4': anotherAccount,
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
