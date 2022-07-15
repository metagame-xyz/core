import Head from 'next/head'
import React, { useEffect, useState } from 'react'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import { AccordionButton, Box, Button, Heading, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { parseEther } from '@ethersproject/units'
import { BigNumber, Contract } from 'ethers'
import { addressToNameObject } from 'onoma'
import { useAccount } from 'wagmi'

import {
    ALCHEMY_PROJECT_ID,
    blackholeAddress,
    CONTRACT_ADDRESS,
    METABOT_API_URL,
    networkStrings,
    WEBSITE_URL,
} from 'utils/constants'
import { copy } from 'utils/content'
import { debug, event } from 'utils/frontend'
import { fetcher } from 'utils/frontend'
import { Metadata } from 'utils/metadata'

import { maxW } from 'components/Layout'

function About({ heading, text }) {
    return (
        <VStack maxW={['sm', 'md', 'md', 'full']}>
            <Heading as="h2" fontSize="24px">
                {heading}
            </Heading>
            <Text align="center">{text}</Text>
        </VStack>
    )
}

function heartbeatShowerLink(tokenId: number): string {
    return `https://${WEBSITE_URL}/heart/${tokenId}`
}

function Home({ metadata }) {
    // const { provider, signer, userAddress, userName, eventParams, openWeb3Modal, toast } = useEthereum();
    const [{ data: account, error, loading }] = useAccount({
        fetchEns: true,
    })
    const [isWhitelisted, setWhitelisted] = useState(false)
    const [whitelistLoading, setWhitelistLoading] = useState(true)

    useEffect(() => {
        if (account) {
            const data = console.log('calling', account.address)
            const body = JSON.stringify(data)
            fetcher(`${METABOT_API_URL}premintCheck?` + new URLSearchParams({ address: account.address }), {
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors',
            })
                .then((resp) => {
                    setWhitelisted(true)
                    setWhitelistLoading(false)
                })
                .catch((err) => {
                    console.log('WHITELIST ERR', err)
                    setWhitelistLoading(false)
                })
        }
    }, [account])

    // const contract = new Contract(CONTRACT_ADDRESS, heartbeat.abi, provider);

    // let [minted, setMinted] = useState(false);
    // let [minting, setMinting] = useState(false);
    // let [userTokenId, setUserTokenId] = useState<number>(null);

    // let [mintCount, setMintCount] = useState<number>(null);

    // useEffect(() => {
    //     async function getUserMintedTokenId() {
    //         // userAddress has changed. TokenId defaults to null
    //         let tokenId = null;
    //         try {
    //             if (userAddress) {
    //                 const filter = contract.filters.Transfer(
    //                     blackholeAddress,
    //                     userAddress,
    //                 );
    //                 const [event] = await contract.queryFilter(filter); // get first event, should only be one
    //                 if (event) {
    //                     tokenId = event.args[2].toNumber();
    //                 }
    //             }
    //         } catch (error) {
    //             toast(toastErrorData('Get User Minted Token Error', JSON.stringify(error)));
    //             debug({ error });
    //         } finally {
    //             // set it either to null, or to the userAddres's tokenId
    //             setUserTokenId(tokenId);
    //         }
    //     }
    //     getUserMintedTokenId();
    // }, [userAddress]);

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
    return (
        <Box>
            <Head>
                <title>{copy.title}</title>
            </Head>
            <Box px={8} pt={8} width="fit-content" mx="auto" maxW={maxW}>
                <Heading as="h1" fontSize={[54, 72, 96]} textAlign="center" color="brand.900">
                    {copy.title}
                </Heading>
                <Text fontSize={[16, 22, 30]} fontWeight="light" maxW={['container.md']} pb={4}>
                    {copy.heroSubheading}
                    <br />
                    {account?.address}
                </Text>
                <Text fontSize={[16, 22, 30]} fontWeight="light" maxW={['container.md']} pb={4}>
                    {!whitelistLoading && account ? <>{isWhitelisted ? 'Mint' : 'Not whitelisted'}</> : null}
                </Text>
                <div
                    style={{
                        aspectRatio: '1/1',
                        width: '80%',
                        maxWidth: '800px',
                    }}
                ></div>
            </Box>
            <Box px={8} py={8} width="fit-content" margin="auto" maxW={maxW}>
                <SimpleGrid columns={[1, 1, 1, 3]} spacing={16}>
                    <About heading={copy.heading1} text={copy.text1} />
                    <About heading={copy.heading2} text={copy.text2} />
                    <About heading={copy.heading3} text={copy.text3} />
                </SimpleGrid>
            </Box>

            {/* <VStack justifyContent="center" spacing={4} px={4} py={8} bgColor="brand.700">
                {!minted && !userTokenId ? (
                    <Button
                        onClick={userAddress ? mint : () => openWeb3Modal('Main Page Section')}
                        isLoading={minting}
                        loadingText="Minting..."
                        isDisabled={minted}
                        fontWeight="normal"
                        colorScheme="brand"
                        bgColor="brand.600"
                        // color="brand.900"
                        _hover={{ bg: 'brand.500' }}
                        size="lg"
                        height="60px"
                        minW="xs"
                        boxShadow="lg"
                        fontSize="4xl"
                        borderRadius="full">
                        {userAddress ? mintText() : 'Connect Wallet'}
                    </Button>
                ) : (
                    <Box fontSize={[24, 24, 36]} color="white">
                        <Text>{`${userName}'s ${copy.title} (#${userTokenId}) has been minted.`}</Text>
                        <Button
                            colorScheme="brand"
                            color="white"
                            variant="outline"
                            _hover={{ bgColor: 'brand.600' }}
                            _active={{ bgColor: 'brand.500' }}
                            mt={2}
                            size="lg"
                            rightIcon={<ExternalLinkIcon />}
                            onClick={() => window.open(heartbeatShowerLink(userTokenId))}>
                            View your Heartbeat
                        </Button>
                    </Box>
                )}
                {textUnderButton()}
            </VStack> */}
            <Box px={8} py={20} width="fit-content" margin="auto" maxW={maxW}>
                <Heading as="h1" fontSize={['24', '24', '36']} textAlign="center">
                    {copy.bottomSectonHeading}
                </Heading>
                <Text mt={4} fontWeight="light" maxW="xl">
                    {copy.bottomSectionText}
                    <Link isExternal href={'https://twitter.com/The_Metagame'}>
                        @The_Metagame
                    </Link>
                </Text>
            </Box>
        </Box>
    )
}

export default Home
