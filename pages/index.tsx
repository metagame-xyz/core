import Head from 'next/head'
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react'

import { Button } from '@chakra-ui/react'
import { datadogRum } from '@datadog/browser-rum'
import { parseEther } from '@ethersproject/units'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { llamaPfpABI } from 'abis/llamaPfpABI'
import { BigNumber, Contract, ethers } from 'ethers'
import { AddressZ } from 'evm-translator/lib/interfaces/utils'
import { getEntries } from 'evm-translator/lib/utils'
import { useAccount, useEnsName, useNetwork, useProvider, useSigner, useSignMessage } from 'wagmi'
import { any } from 'zod'

import { UpdatePfpBody } from 'api/llama/updatePfp'

import { blackholeAddress, LLAMA_PFP_CONTRACT_ADDRESS } from 'utils/constants'
import { fetcher } from 'utils/frontend'

const jwt = ''
const llamaUserId = 'e209a559-41e8-4e45-b71e-fb10604e0107'

const devUrl = 'https://core-dev.themetagame.xyz'
const localUrl = 'http://localhost:3000'

const domain = localUrl

const url = `${domain}/api/llama/0x17a059b6b0c8af433032d554b0392995155452e6?llamaUserId=${llamaUserId}&jwt=${jwt}`

const updatePfpUrl = `${domain}/api/llama/updatePfp`
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

    const body: UpdatePfpBody = {
        llamaUserId,
        requestedLayers: [
            { category: 'Background', name: 'Purple - Blue - Green' },
            { category: 'Body', name: 'Black' },
            { category: 'Eyes', name: 'Squinty' },
        ],
        jwt,
        signature: null,
    }

    const {
        error: signError,
        isLoading: userIsSigning,
        signMessage,
    } = useSignMessage({
        async onSuccess(data, variables, context) {
            console.log('signed message', data, variables, context)
            body.signature = data
            const returnData = await fetch(updatePfpUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }).then((res) => res.json())

            console.log('returnData', returnData)
        },
    })

    console.log('signError', signError)
    console.log('userIsSigning', userIsSigning)

    const sign = () => {
        // const layersMap = userData.existingNftMetadata.layers
        // const layersArr = getEntries(layersMap).map(([key, value]) => ({ category: key, name: value }))
        signMessage({ message: JSON.stringify(body.requestedLayers) })
    }

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
                signature: null,
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
            <Button onClick={sign}> sign </Button>
            <Image
                src="https://metagame-xyz.s3.us-east-1.amazonaws.com/nft-images/llamaPfp/Layers/Body/Brown_with_Mane.png"
                alt="llama"
                width={50}
                height={50}
            />
        </>
    )
}

export default Home
