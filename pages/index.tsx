import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'

import { datadogRum } from '@datadog/browser-rum'
import { parseEther } from '@ethersproject/units'
import axios from 'axios'
import { BigNumber, ethers } from 'ethers'
import { getEntries } from 'evm-translator'
import { AddressZ } from 'evm-translator/lib/interfaces/utils'
import { useAccount, useEnsName, useNetwork, useProvider, useSigner } from 'wagmi'
import { any } from 'zod'

import { blackholeAddress } from 'utils/constants'
import { fetcher } from 'utils/frontend'

const url =
    'https://core-dev.themetagame.xyz/api/llama/0x17a059b6b0c8af433032d554b0392995155452e6?llamaUserId=e51d4acf-04e9-4abd-964d-d61e42d5e858&jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2NvbW11bml0eS5sbGFtYS54eXoiLCJpc3MiOiJhcHAuZHluYW1pYy54eXovNDJjNDRiODAtMjI0MC00MGVhLThlMDEtMjNiN2U4OGUyNmE2Iiwic3ViIjoiZTIwOWE1NTktNDFlOC00ZTQ1LWI3MWUtZmIxMDYwNGUwMTA3IiwiYmxvY2tjaGFpbl9hY2NvdW50cyI6W3siYWRkcmVzcyI6IjB4MTdBMDU5QjZCMEM4YWY0MzMwMzJkNTU0QjAzOTI5OTUxNTU0NTJFNiIsImNoYWluIjoiZWlwMTU1IiwiaWQiOiI3Mjk1MTVjNi03MGJhLTQ1NjItYmI2Mi1hZjMxZWUxM2FhNmMiLCJuYW1lX3NlcnZpY2UiOnt9LCJ3YWxsZXRfbmFtZSI6Im1ldGFtYXNrIn1dLCJlbnZpcm9ubWVudF9pZCI6IjQyYzQ0YjgwLTIyNDAtNDBlYS04ZTAxLTIzYjdlODhlMjZhNiIsImxhc3RfYXV0aGVudGljYXRlZF9hY2NvdW50X2lkIjoiNzI5NTE1YzYtNzBiYS00NTYyLWJiNjItYWYzMWVlMTNhYTZjIiwibGlzdHMiOlsiTGxhbWEgY29tbXVuaXR5IGFsbG93IGxpc3QiXSwidmVyaWZpZWRfYWNjb3VudCI6eyJhZGRyZXNzIjoiMHgxN0EwNTlCNkIwQzhhZjQzMzAzMmQ1NTRCMDM5Mjk5NTE1NTQ1MkU2IiwiY2hhaW4iOiJlaXAxNTUiLCJpZCI6IjcyOTUxNWM2LTcwYmEtNDU2Mi1iYjYyLWFmMzFlZTEzYWE2YyIsIm5hbWVfc2VydmljZSI6e30sIndhbGxldF9uYW1lIjoibWV0YW1hc2sifSwiaW5mbyI6eyJjaGFpbiI6IkVWTSIsImVucyI6e30sImVudmlyb25tZW50SWQiOiI0MmM0NGI4MC0yMjQwLTQwZWEtOGUwMS0yM2I3ZTg4ZTI2YTYiLCJsaXN0cyI6WyJMbGFtYSBjb21tdW5pdHkgYWxsb3cgbGlzdCJdLCJ1c2VySWQiOiJlMjA5YTU1OS00MWU4LTRlNDUtYjcxZS1mYjEwNjA0ZTAxMDciLCJ3YWxsZXQiOiJtZXRhbWFzayIsIndhbGxldFB1YmxpY0tleSI6IjB4MTdBMDU5QjZCMEM4YWY0MzMwMzJkNTU0QjAzOTI5OTUxNTU0NTJFNiJ9LCJpYXQiOjE2Njc1OTEwNTAsImV4cCI6MTY2NzU5ODI1MH0.dUlQ_Na2R839iJGC8QBfie-v0Kg-TeI9QxOnfRkl3xc_PlcuVHWibsHKufQ105S1ScQyxIsvPb7bIGHKqcTA4BZKIwcj-J6ASE6bTsS9py4W3_M9VQvAJ_DQAodnAMRucM-YeZrV1BgYZg5AU1Gh6sUO141JFnEjwW5xw6aWVYzc1LBBzid4VPZJ0Hk5xCuv7kZ3RFolaljbGBtUlnvBq39DdAlXATfIE0XoF2jJUOsBzSxk66yoUxCAEj2q3quWVhLddoEnm2uNy3bhn6BfJ3MSn1YyUEZS94FRSI2ZzOW-vEncMdqou6QxThJ1n7b9XEjv1kCJ9_rxWux3zhvnaJ3YNYgyMIkZki4cRRTXyGv3H5OprRUmDMhrvqBr2iuM9ZHCXtnsXfXaZ8zC49Sku5-ovg96v5_78yGWX0KaNZp3q0ELbs0STiY9sJ0AwwjxP1NmQxlimjOlJqvjkxo_aLrW4tts1QYnLAphW5mDdsFD0f_SEdvadabkrXMQJjTDl2zeKpnzkapcyGMYvRrpsTkvDfjbyzBZiggbPp6BWvVIx48L9Gi3N8ElZWfMiE-AO6Rj_roQPKk9VHdSrQad793TpgwixyDVXo1-7chHDzReZFInmAeZjdigDNQ_AnfAwRJ5qtlT9ND881PG312jU3Iq0HXDMIcyM27j7z7KW-o'

const EXAMPLE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
const EXAMPLE_CONTRACT_ABI = []

const Home = () => {
    // const { address: uncleanAddress } = useAccount({ onDisconnect: datadogRum.removeUser })
    // const { chain } = useNetwork()

    // const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress
    // const { data: ensName } = useEnsName({ address })

    const [data, setData] = useState<Record<any, any>>({})

    // useEffect(() => {
    //     if (address) {
    //         datadogRum.setUser({
    //             id: address,
    //             name: ensName,
    //         })
    //     }
    // }, [address])

    // const provider = useProvider()
    // const { data: signer } = useSigner()
    // const contract = new ethers.Contract(EXAMPLE_CONTRACT_ADDRESS, EXAMPLE_CONTRACT_ABI, provider)

    useEffect(() => {
        const getData = async (): Promise<void> => {
            const returnData = await fetch(url, {}).then((res) => res.json())
            setData(returnData)
            console.log(returnData)
        }
        getData()
        console.log(data)
    }, [])

    return <>{data.usedNonModifiableCombos}</>
}

export default Home
