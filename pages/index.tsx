import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'

import { datadogRum } from '@datadog/browser-rum'
import { parseEther } from '@ethersproject/units'
import axios from 'axios'
import { BigNumber, ethers } from 'ethers'
import { AddressZ } from 'evm-translator/lib/interfaces/utils'
import { useAccount, useEnsName, useNetwork, useProvider, useSigner } from 'wagmi'

import { blackholeAddress } from 'utils/constants'

import Footer from 'components/Footer'
import { Logo, Opensea, Twitter } from 'components/Icons'
import MintButton, { MintStatus } from 'components/MintButton'

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
    const contractWithSigner = contract.connect(signer)

    const [expandedSignature, setExpandedSignature] = useState({ v: null, r: null, s: null })
    const [contentContainer, setContentContainer] = useState<HTMLElement | null>(null)
    const [mintStatus, setMintStatus] = useState<MintStatus>(MintStatus.unknown)

    const [userTokenId, setUserTokenId] = useState<number>(null)

    const [showMetabotModal, setShowMetabotModal] = useState(false)
    const [showProcessingModal, setShowProcessingModal] = useState(false)
    const [showMintedModal, setShowMintedModal] = useState(false)

    useEffect(() => {
        async function getUserMintedTokenId() {
            // userAddress has changed. TokenId defaults to null
            let tokenId = null
            let allowlist = false
            let signature = { v: null, r: null, s: null }
            let errorCode = null
            let localMintStatus = MintStatus.loading
            setMintStatus(localMintStatus)

            try {
                if (address) {
                    const filter = contract.filters.Transfer(blackholeAddress, address)
                    const [event] = await contract.queryFilter(filter) // get first event, should only be one
                    if (event) {
                        tokenId = event.args[2].toNumber()
                        localMintStatus = MintStatus.minted
                    }
                }

                if (address && localMintStatus !== MintStatus.minted) {
                    ;({ allowlist, signature, errorCode } = await axios
                        .get(`/api/premintCheck/${address}`)
                        .then((res) => res.data))

                    if (errorCode === 1) {
                        localMintStatus = MintStatus.metabot
                        setShowMetabotModal(true)
                    } else if (errorCode === 2) {
                        localMintStatus = MintStatus.processing
                        setShowProcessingModal(true)
                    } else {
                        localMintStatus = MintStatus.can_mint
                    }
                }

                if (!address) {
                    localMintStatus = MintStatus.unknown
                }
            } catch (error) {
                console.error(error)
                // toast(toastErrorData('Get User Minted Token Error', JSON.stringify(error)))
            } finally {
                setUserTokenId(tokenId)
                setExpandedSignature(signature)
                setMintStatus(localMintStatus)
            }
        }
        getUserMintedTokenId()
    }, [address, chain?.id])

    const mint = async () => {
        // const provider = new ethers.providers.Web3Provider(provider)
        // const signer = provider.getSigner()
        const previousMintStatus = mintStatus
        setMintStatus(MintStatus.minting)

        try {
            const tx = await contractWithSigner.mintWithSignature(
                address,
                expandedSignature.v,
                expandedSignature.r,
                expandedSignature.s,
                {
                    value: parseEther('0.02'),
                },
            )
            const txReceipt = await tx.wait()
            const [fromAddress, toAddress, tokenId] = txReceipt.events.find((e) => (e.event = 'Transfer')).args as [
                string,
                string,
                BigNumber,
            ]

            datadogRum.addAction('mint success', {
                txHash: tx.hash,
                tokenId: tokenId.toString(),
            })

            setUserTokenId(tokenId.toNumber())
            setMintStatus(MintStatus.minted)
            setShowMintedModal(true)
        } catch (error) {
            console.error(error)
            setMintStatus(previousMintStatus)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let mintButtonAction = () => {}
    switch (mintStatus) {
        case MintStatus.can_mint:
            mintButtonAction = () => mint()
            break
        case MintStatus.metabot:
            mintButtonAction = () => setShowMetabotModal(true)
            break
        case MintStatus.processing:
            mintButtonAction = () => setShowProcessingModal(true)
            break
        case MintStatus.minted:
            mintButtonAction = () => {
                window.open(`/logbook/${userTokenId}`, '_blank')
            }
        case MintStatus.unknown:
        default:
            break
    }

    const clickable = [MintStatus.can_mint, MintStatus.metabot, MintStatus.processing, MintStatus.minted].includes(
        mintStatus,
    )

    return <>Update Me</>
}

export default Home
