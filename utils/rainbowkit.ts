import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { ALCHEMY_PROJECT_ID } from 'utils/constants'

const { chains, provider } = configureChains(
    [chain.mainnet, chain.rinkeby],
    [alchemyProvider({ alchemyId: ALCHEMY_PROJECT_ID }), publicProvider()],
)

const { connectors } = getDefaultWallets({
    appName: 'Logbook',
    chains,
})

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
})

export { chains, wagmiClient }
