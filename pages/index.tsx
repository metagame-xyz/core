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

const url =
    'https://core-dev.themetagame.xyz/api/llama/0x17a059b6b0c8af433032d554b0392995155452e6?llamaUserId=e209a559-41e8-4e45-b71e-fb10604e0107&jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2NvbW11bml0eS5sbGFtYS54eXoiLCJpc3MiOiJhcHAuZHluYW1pYy54eXovNDJjNDRiODAtMjI0MC00MGVhLThlMDEtMjNiN2U4OGUyNmE2Iiwic3ViIjoiZTIwOWE1NTktNDFlOC00ZTQ1LWI3MWUtZmIxMDYwNGUwMTA3IiwiYmxvY2tjaGFpbl9hY2NvdW50cyI6W3siYWRkcmVzcyI6IjB4MTdBMDU5QjZCMEM4YWY0MzMwMzJkNTU0QjAzOTI5OTUxNTU0NTJFNiIsImNoYWluIjoiZWlwMTU1IiwiaWQiOiI3Mjk1MTVjNi03MGJhLTQ1NjItYmI2Mi1hZjMxZWUxM2FhNmMiLCJuYW1lX3NlcnZpY2UiOnt9LCJ3YWxsZXRfbmFtZSI6Im1ldGFtYXNrIn1dLCJlbnZpcm9ubWVudF9pZCI6IjQyYzQ0YjgwLTIyNDAtNDBlYS04ZTAxLTIzYjdlODhlMjZhNiIsImxhc3RfYXV0aGVudGljYXRlZF9hY2NvdW50X2lkIjoiNzI5NTE1YzYtNzBiYS00NTYyLWJiNjItYWYzMWVlMTNhYTZjIiwibGlzdHMiOlsiTGxhbWEgY29tbXVuaXR5IGFsbG93IGxpc3QiXSwidmVyaWZpZWRfYWNjb3VudCI6eyJhZGRyZXNzIjoiMHgxN0EwNTlCNkIwQzhhZjQzMzAzMmQ1NTRCMDM5Mjk5NTE1NTQ1MkU2IiwiY2hhaW4iOiJlaXAxNTUiLCJpZCI6IjcyOTUxNWM2LTcwYmEtNDU2Mi1iYjYyLWFmMzFlZTEzYWE2YyIsIm5hbWVfc2VydmljZSI6e30sIndhbGxldF9uYW1lIjoibWV0YW1hc2sifSwiaW5mbyI6eyJjaGFpbiI6IkVWTSIsImVucyI6e30sImVudmlyb25tZW50SWQiOiI0MmM0NGI4MC0yMjQwLTQwZWEtOGUwMS0yM2I3ZTg4ZTI2YTYiLCJsaXN0cyI6WyJMbGFtYSBjb21tdW5pdHkgYWxsb3cgbGlzdCJdLCJ1c2VySWQiOiJlMjA5YTU1OS00MWU4LTRlNDUtYjcxZS1mYjEwNjA0ZTAxMDciLCJ3YWxsZXQiOiJtZXRhbWFzayIsIndhbGxldFB1YmxpY0tleSI6IjB4MTdBMDU5QjZCMEM4YWY0MzMwMzJkNTU0QjAzOTI5OTUxNTU0NTJFNiJ9LCJpYXQiOjE2Njc4MzQ3NjEsImV4cCI6MTY2Nzg0MTk2MX0.KPrp9LsSA6Yp5hvUYwzzZSaIz1xE59_p06ZYg_M9r4EyZ5GcDj5wbRdFBNlPlvMT8WYPBFSEaDYd6Fj5KcZIXgsNfuuX8iVTT3XLtp8Z8HbTDICkpCP9eVHrt2xj3I3jqvffFdIVTZZuY9-Laq5cZuE7M8RxxDcKoK79ehFpRIEjuvESltjMo0EpDUI3c2zTwEIAuOGmPW9AYv4j1vGmCCNl9-ZMAZ-Qn68VUPlQpBaEXzITZELku7N0C90vXg9d4h8ZOrKWVeEgNhoj9fxmVVh7eJPKQm22FvAZqBpTvQhM7wAQXyzldM0OmBRISsjDJNKJr70fkG5JwnxGHBmZdKKXKcWxrB1A3LdFHWnChRLU0LL9AzIsbH4HxM4DPncIfVH069ELwjMoTB_S2bzAU2PAFbStCVuaVnrHsjNVRTbo0ZkqKgYM5aUYouXde6wzX7PS7KLQlzkOBL5pgqnAyY9GKDbGuDMbwTU4xEsmBL4fmq2g-GoIaZRSmZDY-Z-ZCjijJJiC1CFsJ8NW1tkYWAu_zTNV2Qd9Ub1rOMRkmf5I1kFkq06p0qT2WlJe6plH3Wrvum6M6_15vW--sInvuYOqGJlwvxDBvdmzVVOF_zdveAsnLS57V2q9BZpARLg64OWw0a6QLKYUiCnxJf7QlWSkGxYYqYKfxSN1cXTIjuA'

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
