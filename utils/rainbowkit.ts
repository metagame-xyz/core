import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { ALCHEMY_PROJECT_ID } from 'utils/constants'
import { appName } from 'utils/content'

const { chains, provider } = configureChains(
    [chain.mainnet, chain.goerli],
    [alchemyProvider({ apiKey: ALCHEMY_PROJECT_ID }), publicProvider()],
)

const { connectors } = getDefaultWallets({ appName, chains })

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
})

export { chains, wagmiClient }
