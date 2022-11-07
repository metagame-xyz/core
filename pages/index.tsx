import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'

import { Button } from '@chakra-ui/react'
import { datadogRum } from '@datadog/browser-rum'
import { parseEther } from '@ethersproject/units'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { llamaPfpABI } from 'abis/llamaPfpABI'
import { BigNumber, Contract, ethers } from 'ethers'
import { getEntries } from 'evm-translator'
import { AddressZ } from 'evm-translator/lib/interfaces/utils'
import { useAccount, useEnsName, useNetwork, useProvider, useSigner } from 'wagmi'
import { any } from 'zod'

import { blackholeAddress, LLAMA_PFP_CONTRACT_ADDRESS } from 'utils/constants'
import { fetcher } from 'utils/frontend'

const url = ''

const EXAMPLE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
const EXAMPLE_CONTRACT_ABI = []

const Home = () => {
    const { address: uncleanAddress } = useAccount({ onDisconnect: datadogRum.removeUser })
    const { chain } = useNetwork()
    const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress
    const provider = useProvider()
    const { data: signer } = useSigner()

    // const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress
    // const { data: ensName } = useEnsName({ address })

    const [userData, setData] = useState<Record<any, any>>({})

    const llamaContract = new Contract(LLAMA_PFP_CONTRACT_ADDRESS, llamaPfpABI, provider)
    const contractWithSigner = llamaContract.connect(signer)

    const mint = async () => {
        try {
            const tx = await contractWithSigner.mintWithSignature(
                address,
                userData.checkResponse.signature.v,
                userData.checkResponse.signature.r,
                userData.checkResponse.signature.s,
            )
            const txReceipt = await tx.wait()
            console.log(txReceipt)
        } catch (e) {
            console.log(e)
        }
    }

    // useEffect(() => {
    //     if (address) {
    //         datadogRum.setUser({
    //             id: address,
    //             name: ensName,
    //         })
    //     }
    // }, [address])

    useEffect(() => {
        const getData = async (): Promise<void> => {
            const returnData = await fetch(url, {}).then((res) => res.json())
            setData(returnData)
            console.log('returnData', returnData)
        }
        getData()
        console.log(userData)
    }, [])

    return (
        <>
            <ConnectButton />
            <Button onClick={mint}> click me </Button>
        </>
    )
}

export default Home
