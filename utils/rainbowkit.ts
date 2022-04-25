import { Chain, connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { providers } from 'ethers'
import { chain } from 'wagmi'

import { INFURA_PROJECT_ID } from './constants'

export const provider = ({ chainId }: { chainId?: number }) => new providers.InfuraProvider(chainId, INFURA_PROJECT_ID)

export const chains: Chain[] = [
    { ...chain.mainnet, name: 'Ethereum' },
    { ...chain.polygonMainnet, name: 'Polygon' },
    { ...chain.optimism, name: 'Optimism' },
    { ...chain.arbitrumOne, name: 'Arbitrum' },
]

const wallets = getDefaultWallets({
    chains,
    infuraId: INFURA_PROJECT_ID,
    appName: 'Onoma',
    jsonRpcUrl: ({ chainId }) => chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ?? chain.mainnet.rpcUrls[0],
})

export const connectors = connectorsForWallets(wallets)
