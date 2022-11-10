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

import { UpdatePfpBody } from 'api/llama/updatePfp'

import { blackholeAddress, LLAMA_PFP_CONTRACT_ADDRESS } from 'utils/constants'
import { fetcher } from 'utils/frontend'

const jwt = ''
const llamaUserId = 'e209a559-41e8-4e45-b71e-fb10604e0107'

const url = `https://core-dev.themetagame.xyz/api/llama/0x17a059b6b0c8af433032d554b0392995155452e6?llamaUserId=${llamaUserId}&jwt=${jwt}`

const updatePfpUrl = 'https://core-dev.themetagame.xyz/api/llama/updatePfp'
// const updatePfpUrl = 'http://localhost:3000/api/llama/updatePfp'

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

    const updatePfp = async () => {
        try {
            const body: UpdatePfpBody = {
                llamaUserId,
                requestedLayers: [
                    { category: 'Background', name: 'Purple - Blue - Green' },
                    { category: 'Body', name: 'Black' },
                    { category: 'Eyes', name: 'Squinty' },
                ],
                jwt,
            }

            const returnData = await fetch(updatePfpUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }).then((res) => res.json())

            console.log('returnData', returnData)
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
            <Button onClick={mint}> mint </Button>
            <Button onClick={updatePfp}> update </Button>
        </>
    )
}

export default Home
