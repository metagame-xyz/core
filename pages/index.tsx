import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'

import { datadogRum } from '@datadog/browser-rum'
import { parseEther } from '@ethersproject/units'
import axios from 'axios'
import { BigNumber, ethers } from 'ethers'
import { AddressZ } from 'evm-translator/lib/interfaces/utils'
import { Box, Button, Image, ResponsiveContext, Stack, Text } from 'grommet'
import { useLottie } from 'lottie-react'
import newThing from 'public/static/animations/enigma-small.json'
import { useAccount, useEnsName, useNetwork, useProvider, useSigner } from 'wagmi'

import { blackholeAddress, LOGBOOK_CONTRACT_ADDRESS } from 'utils/constants'
import logbookAbi from 'utils/logbookAbi'

import CustomConnectButton from 'components/ConnectButton'
import Footer from 'components/Footer'
import { Etherscan, Logo, Opensea, Twitter } from 'components/Icons'
import LgbkLayer from 'components/LgbkLayer'
import MintButton, { MintStatus } from 'components/MintButton'
import PlusBorder from 'components/PlusBorder'

const options = {
    loop: true,
    animationData: newThing,
}

const Home = () => {
    // const { provider, signer, userAddress, userName, eventParams, openWeb3Modal, toast } = useEthereum();
    const {
        address: uncleanAddress,
        isConnecting,
        isDisconnected,
    } = useAccount({ onDisconnect: datadogRum.removeUser })
    const { chain } = useNetwork()

    const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress
    const { data: ensName } = useEnsName({ address })

    const { View, animationLoaded } = useLottie(options)

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
    const contract = new ethers.Contract(LOGBOOK_CONTRACT_ADDRESS, logbookAbi, provider)
    const contractWithSigner = contract.connect(signer)

    const [expandedSignature, setExpandedSignature] = useState({ v: null, r: null, s: null })
    const [contentContainer, setContentContainer] = useState<HTMLElement | null>(null)
    const [mintStatus, setMintStatus] = useState<MintStatus>(MintStatus.unknown)

    const [userTokenId, setUserTokenId] = useState<number>(null)

    const [showMetabotModal, setShowMetabotModal] = useState(false)
    const [showProcessingModal, setShowProcessingModal] = useState(false)
    const [showMintedModal, setShowMintedModal] = useState(false)

    // let cantMintReason = null

    // if (errorCode === 1) cantMintReason = `You're not on the allowlist yet. Plz message Metabot`
    // if (errorCode === 2)
    //     cantMintReason = `You're on the allowlist but the Enigma Machine hasn't finished processing your data`

    const isMobile = useContext(ResponsiveContext) === 'small'

    useEffect(() => {
        const contentLayerElement = document.querySelector('.main-stack').children[1] as HTMLElement
        contentLayerElement.style.overflowY = 'auto'
        contentLayerElement.classList.add('content-layer')
        setContentContainer(document.querySelector('.content-container') as HTMLElement)
    }, [])

    useEffect(() => {
        const zoomElement = document.querySelector('.zoom') as HTMLElement
        const BASE_ZOOM = isMobile ? 1.25 : 0.8

        zoomElement.style.transform = `scale(${BASE_ZOOM})`

        let zoom = BASE_ZOOM
        const ZOOM_SPEED = isMobile ? 0.2 : 0.05

        let xDown = null
        let yDown = null

        let hasContentAppeared = false // fix for ios safari scroll bug

        const handleWheel = (e) => {
            const svgElement = document.querySelector('.zoom')?.querySelector('g')
            const contentLayerElement = document.querySelector('.content-layer')
            if (e.deltaY > 0 && window.innerWidth * 1.4 > svgElement.getBoundingClientRect().width) {
                e.preventDefault()
                zoom += ZOOM_SPEED
                zoomElement.style.transform = `scale(${zoom})`
            } else if (e.deltaY < 0 && zoom > BASE_ZOOM && !contentLayerElement.scrollTop) {
                e.preventDefault()
                zoom -= ZOOM_SPEED
                zoomElement.style.transform = `scale(${zoom})`
            }
        }

        const getTouches = (e) => {
            return (
                e.touches || // browser API
                e.originalEvent.touches
            ) // jQuery
        }

        const handleTouchStart = (e) => {
            const firstTouch = getTouches(e)[0]
            xDown = firstTouch.clientX
            yDown = firstTouch.clientY
        }

        const handleTouchMove = (e) => {
            const xUp = e.touches[0].clientX
            const yUp = e.touches[0].clientY

            const xDiff = xDown - xUp
            const yDiff = yDown - yUp

            const svgElement = document.querySelector('.zoom')?.querySelector('g')
            const contentLayerElement = document.querySelector('.content-layer')

            if (Math.abs(xDiff) < Math.abs(yDiff) && svgElement) {
                if (yDiff > 0 && window.innerHeight > svgElement.getBoundingClientRect().height) {
                    e.preventDefault()
                    zoom += ZOOM_SPEED
                    zoomElement.style.transform = `scale(${zoom})`
                } else if (yDiff < 0 && zoom > BASE_ZOOM && !contentLayerElement.scrollTop && !hasContentAppeared) {
                    e.preventDefault()
                    zoom -= ZOOM_SPEED
                    zoomElement.style.transform = `scale(${zoom})`
                } else if (window.innerHeight <= svgElement.getBoundingClientRect().height) {
                    // don't allow any more zooming out after content shows up
                    hasContentAppeared = true
                }
            }
            /* reset values */
            xDown = xUp
            yDown = yUp
        }

        document.addEventListener('wheel', handleWheel, { passive: false, capture: false })

        document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: false })
        document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: false })
    }, [isMobile])

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
                    console.log('address', address)
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

                console.log('tokenId', tokenId)
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
                    gasLimit: 2100000,
                    gasPrice: 8000000000,
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

            console.log('Transaction:', tx.hash)

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

    return (
        <>
            <Head>
                <title>Logbook</title>
                <meta property="og:title" content="Logbook" />
                {/* <meta property="og:description" content={description} /> */}
                <meta name="twitter:title" content="Logbook" />
            </Head>
            <Stack fill="horizontal" className="main-stack" interactiveChild={1}>
                <Box height="100vh" className="zoom" justify="center">
                    <>{View}</>
                    {/* {animationLoaded ? (
                    <div id="wtfguys">{View}</div>
                ) : (
                    <div hidden id="hello">
                        {View}
                    </div>
                )} */}
                    {/* <Lottie options={options} width="fit-content" /> */}
                </Box>
                <Box>
                    <Box style={{ height: `${isMobile ? '80' : '92'}vh` }} />
                    <Box pad={isMobile ? 'none' : 'medium'}>
                        <Box
                            background="backgroundLight"
                            round={isMobile ? 'none' : 'small'}
                            pad="small"
                            direction="row"
                            gap="large"
                            flex
                        >
                            {!isMobile ? <PlusBorder contentContainer={contentContainer} /> : null}
                            <Box margin="small" fill gap="large" className="content-container">
                                <Image src="/static/assets/logbookLogo.svg" alt="Logbook Logo" />
                                <Box direction={isMobile ? 'column' : 'row'} gap="medium">
                                    <Box basis="2/3">
                                        <Text color="brand">
                                            Welcome to Metagame's latest artifact, Logbook. Like all of our other
                                            artifacts, you've already been collecting entries as you go about your days.{' '}
                                            <br />
                                            <br /> Now you can see your activities reflected and benefit from them in
                                            new ways. Logbook is an aggregation of all the actions you've taken on-chain
                                            in a way you've never seen before - in a digestible way that you and other
                                            people can understand.
                                            <br />
                                            <br />
                                            After you've minted your Logbook, you'll have access to $5,000 USDC worth of
                                            bounties to help better interpret on-chain activity.
                                        </Text>
                                    </Box>

                                    <Box align="end" gap="medium" basis="1/3">
                                        <CustomConnectButton />
                                        {mintStatus !== MintStatus.unknown && (
                                            <MintButton
                                                mintStatus={mintStatus}
                                                clickable={clickable}
                                                action={mintButtonAction}
                                            />
                                        )}
                                    </Box>
                                </Box>
                                <Box margin={{ vertical: 'xlarge' }}>
                                    <Image
                                        src={`/static/assets/pageDivider${isMobile ? 'Mobile' : 'Desktop'}.svg`}
                                        alt="Page divider"
                                    />
                                </Box>

                                <Box gap="xlarge" direction={isMobile ? 'column' : 'row'} justify="between">
                                    <Box gap="large">
                                        <Image src={`/static/assets/metagameAsciiLogo.svg`} alt="Metagame ASCII logo" />
                                        <Text color="brand">
                                            Metagame makes products that express activity and achievements in the
                                            ultimate metagame - real life - to unlock access to new spaces, spectacles,
                                            and spoils.
                                            <br />
                                            <br />
                                            We're creating the environments and tooling needed to foster the emergence
                                            of new and existing values-based communities by helping them recognize and
                                            reward those that further their goals. We're starting with NFTs earned from
                                            involvement gathered from on and off-chain activities and will expand into
                                            more expressive mediums like inventory and avatars.
                                            <br />
                                            <br />
                                            Each of us was created on earth without our own consent - we didn't hit
                                            start, and we can't press pause. But we can decide why, how, and where we
                                            play.
                                        </Text>
                                    </Box>
                                    <Image src={`/static/assets/exampleLogbook.svg`} alt="Example logbook" />
                                </Box>
                                <Footer />
                            </Box>
                            {!isMobile ? <PlusBorder contentContainer={contentContainer} /> : null}
                        </Box>
                        <LgbkLayer show={showMetabotModal} close={() => setShowMetabotModal(false)}>
                            <Text textAlign="center">
                                Looks like your ENS isn't on the allowlist yet. Send your ENS to our Telegram bot,
                                Metabot, and they'll get you on there!
                            </Text>
                            <Image src="/metabot_small.png" alt="Metabot Head" height="84px" />
                            <Button
                                size="medium"
                                secondary
                                label="DM Metabot"
                                margin="6px"
                                href="https://t.me/the_meta_bot"
                                target="_blank"
                            />
                        </LgbkLayer>
                        <LgbkLayer show={showProcessingModal} close={() => setShowProcessingModal(false)}>
                            <Text textAlign="center">
                                Your on-chain data is being retrieved and processed by evm-translator. Metabot will send
                                you a DM when it's ready! <br />
                                <br />
                                {/* In the meantime, you can check out more about evm-translator
                                        <a href="https://evm-translator.xyz/contribute" target="_blank">
                                            here
                                        </a> */}
                                There are $5,000 worth of bounties available to help improve evm-translator.
                            </Text>
                            <Image src="/metabot_small.png" alt="Metabot Head" height="84px" />
                            <Button
                                size="medium"
                                secondary
                                label="Go Bounty Hunting"
                                margin="12px"
                                href="https://evm-translator.xyz/contribute"
                                target="_blank"
                            />
                        </LgbkLayer>
                        <LgbkLayer show={showMintedModal} close={() => setShowMintedModal(false)}>
                            <Image src={`/static/assets/congratsAscii.svg`} alt="Congrats ASCII" width="100%" />
                            <Text textAlign="center">Congrats! You&apos;ve successfully minted your Logbook.</Text>
                            <Image src="/metabot_small.png" alt="Metabot Head" height="84px" />
                            <Button primary label="See your Logbook" href={`/logbook/${userTokenId}`} target="_blank" />
                        </LgbkLayer>
                    </Box>
                </Box>
            </Stack>
        </>
    )
}

export default Home

// const contract = new Contract(CONTRACT_ADDRESS, heartbeat.abi, provider);

// let [minted, setMinted] = useState(false);
// let [minting, setMinting] = useState(false);
// let [userTokenId, setUserTokenId] = useState<number>(null);

// let [mintCount, setMintCount] = useState<number>(null);

// useEffect(() => {
//     async function getUserMintedTokenId() {
//         // userAddress has changed. TokenId defaults to null
//         let tokenId = null
//         try {
//             if (userAddress) {
//                 const filter = contract.filters.Transfer(blackholeAddress, userAddress)
//                 const [event] = await contract.queryFilter(filter) // get first event, should only be one
//                 if (event) {
//                     tokenId = event.args[2].toNumber()
//                 }
//             }
//         } catch (error) {
//             toast(toastErrorData('Get User Minted Token Error', JSON.stringify(error)))
//             debug({ error })
//         } finally {
//             // set it either to null, or to the userAddres's tokenId
//             setUserTokenId(tokenId)
//         }
//     }
//     getUserMintedTokenId()
// }, [userAddress])

// Mint Count
// useEffect(() => {
//     async function getMintedCount() {
//         try {
//             console.log('getting mint count');
//             const mintCount: BigNumber = await contract.mintedCount();
//             setMintCount(mintCount.toNumber());
//         } catch (error) {
//             debug({ error });
//         }
//     }
//     const interval = setInterval(getMintedCount, 4000);
//     return () => clearInterval(interval);
// }, []);

// const mint = async () => {
//     event('Mint Button Clicked', eventParams);
//     const network = await provider.getNetwork();
//     if (network.name != networkStrings.ethers) {
//         event('Mint Attempt on Wrong Network', eventParams);
//         toast(wrongNetworkToast);
//         return;
//     }

//     setMinting(true);
//     const contractWritable = contract.connect(signer);
//     const value = parseEther('0.01');
//     try {
//         const data = await contractWritable.mint({ value });
//         const moreData = await data.wait();
//         const [fromAddress, toAddress, tokenId] = moreData.events.find(
//             (e) => (e.event = 'Transfer'),
//         ).args;
//         setUserTokenId(tokenId.toNumber());
//         setMinting(false);
//         setMinted(true);
//         event('Mint Success', eventParams);
//     } catch (error) {
//         // const { reason, code, error, method, transaction } = error
//         setMinting(false);

//         if (error?.error?.message) {
//             const eventParamsWithError = {
//                 ...eventParams,
//                 errorMessage: error.error.message,
//                 errorReason: error.reason,
//             };
//             event('Mint Error', eventParamsWithError);
//             toast(toastErrorData(error.reason, error.error.message));
//         }
//     }
// };

// const mintText = () => {
//     if (!minting && !minted) {
//         return 'Mint';
//     } else if (minting) {
//         return 'Minting...';
//     } else if (minted) {
//         return 'Minted';
//     } else {
//         return 'wtf';
//     }
// };

// const textUnderButton = () => {
//     if (userTokenId) {
//         return <></>;
//         // } else if (freeMintsLeft === null || freeMintsLeft > 0) {
//         //     return (
//         //         <Text fontWeight="light" fontSize={['2xl', '3xl']} color="white">
//         //             {`${freeMintsLeft || '?'}/${freeMints} free mints left`}
//         //         </Text>
//         //     );
//     } else {
//         return (
//             <div>
//                 <Text fontWeight="light" fontSize={['xl', '2xl']} color="white">
//                     0.01 ETH to mint
//                 </Text>
//                 {mintCount && (
//                     <Text fontWeight="light" fontSize={['sm', 'md']} color="white">
//                         {`${mintCount} ${copy.title}s have been minted`}
//                     </Text>
//                 )}
//             </div>
//         );
//     }
// };
