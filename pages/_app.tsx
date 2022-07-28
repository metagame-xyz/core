import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { ChakraProvider, extendTheme, Flex } from '@chakra-ui/react'
import '@fontsource/courier-prime'
import '@fontsource/lato'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiConfig } from 'wagmi'

import { chains, wagmiClient } from 'utils/rainbowkit'

// import Layout from 'components/Layout';
// import EthereumProvider from '../providers/EthereumProvider';
import '../styles/globals.css'
import { theme } from '../styles/theme'

const bgSize = ['100px', '120px', '220px', '300px']

function App({ Component, pageProps }: AppProps): JSX.Element {
    const { route } = useRouter()

    const Layout = dynamic(() => import('components/Layout'))

    return (
        <ChakraProvider theme={theme}>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains}>
                    <Flex bgColor="brand.100opaque" width="100%" minH="100vh">
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    </Flex>
                </RainbowKitProvider>
            </WagmiConfig>
        </ChakraProvider>
    )
}

export default App
