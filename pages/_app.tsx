import type { AppProps } from 'next/app'
import { useEffect } from 'react'

import { datadogRum } from '@datadog/browser-rum'
import { darkTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Grommet } from 'grommet'
import { WagmiConfig } from 'wagmi'

import { DATADOG_RUM_APPLICATION_ID, DATADOG_RUM_CLIENT_TOKEN, DATADOG_RUM_ENV } from 'utils/constants'
import { chains, wagmiClient } from 'utils/rainbowkit'

// import Layout from 'components/Layout';
// import EthereumProvider from '../providers/EthereumProvider';
import '../styles/globals.css'
import theme from '../styles/theme'

const customTheme: Theme = darkTheme()
customTheme.fonts.body = 'Lars'
customTheme.colors.modalBackground = '#FBF7F1'
customTheme.colors.modalText = '#C84414'
customTheme.colors.modalTextDim = '#C84414'
customTheme.colors.accentColorForeground = '#FBF7F1'
customTheme.colors.accentColor = '#C84414'
customTheme.colors.modalTextSecondary = 'rgba(0,0,0,0.87)'

function App({ Component, pageProps }: AppProps): JSX.Element {
    useEffect(() => {
        datadogRum.init({
            applicationId: DATADOG_RUM_APPLICATION_ID,
            clientToken: DATADOG_RUM_CLIENT_TOKEN,
            site: 'datadoghq.com',
            service: 'logbook',
            env: DATADOG_RUM_ENV,
            // Specify a version number to identify the deployed version of your application in Datadog
            // version: '1.0.0',
            sampleRate: 100,
            premiumSampleRate: 13,
            trackInteractions: true,
            defaultPrivacyLevel: 'mask-user-input',
        })
        // datadogRum.startSessionReplayRecording()
    }, [])

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={customTheme}>
                <Grommet theme={theme} background="backgroundDark" className="grommet-container">
                    <Component {...pageProps} />
                </Grommet>
            </RainbowKitProvider>
        </WagmiConfig>
    )
}

export default App
