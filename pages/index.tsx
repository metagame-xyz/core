import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'

import { datadogRum } from '@datadog/browser-rum'
import { parseEther } from '@ethersproject/units'
import axios from 'axios'
import { BigNumber, ethers } from 'ethers'
import { AddressZ } from 'evm-translator/lib/interfaces/utils'
import { useAccount, useEnsName, useNetwork, useProvider, useSigner } from 'wagmi'

import { blackholeAddress } from 'utils/constants'

const EXAMPLE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
const EXAMPLE_CONTRACT_ABI = []

const Home = () => {
    const { address: uncleanAddress } = useAccount({ onDisconnect: datadogRum.removeUser })
    const { chain } = useNetwork()

    const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress
    const { data: ensName } = useEnsName({ address })

    useEffect(() => {
        if (address) {
            datadogRum.setUser({
                id: address,
                name: ensName,
            })
        }
    }, [address])

    const provider = useProvider()
    const { data: signer } = useSigner()
    const contract = new ethers.Contract(EXAMPLE_CONTRACT_ADDRESS, EXAMPLE_CONTRACT_ABI, provider)

    return <>Update Me</>
}

export default Home
