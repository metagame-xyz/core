import { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'

import { Anchor, Box, Button, Card, CardBody, Image, ResponsiveContext, Stack, Text } from 'grommet'

import { LOGBOOK_CONTRACT_ADDRESS } from 'utils/constants'
import { clickableIPFSLink } from 'utils/frontend'
import { getSize } from 'utils/generateSvg'
import logbookMongoose from 'utils/logbookMongoose'

import Footer from 'components/Footer'
import PlusBorder from 'components/PlusBorder'

export const getServerSideProps = async (context) => {
    const { tokenId } = context.query

    const metadata = tokenId.includes('0x')
        ? await logbookMongoose.getMetadataForAddress(tokenId)
        : await logbookMongoose.getMetadataForTokenId(tokenId)

    delete metadata.lastUpdated // if we need this then we need https://github.com/blitz-js/superjson#using-with-nextjs
    return {
        props: {
            metadata,
        },
    }
}

function LogbookPage({ metadata }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [contentContainer, setContentContainer] = useState<HTMLElement | null>(null)
    const [downloadPending, setDownloadPending] = useState(false)
    const isMobile = useContext(ResponsiveContext) === 'small'
    const { name, tokenId, image, description } = metadata

    const { width, height } = getSize(metadata)

    const getOpenSeaUrl = (tokenId: string) => {
        return `https://opensea.io/assets/${LOGBOOK_CONTRACT_ADDRESS}/${tokenId}`
    }

    useEffect(() => {
        const contentLayerElement = document.querySelector('.main-stack').children[1] as HTMLElement
        contentLayerElement.style.overflowY = 'auto'
        contentLayerElement.classList.add('content-layer')
        setContentContainer(document.querySelector('.content-container') as HTMLElement)
    }, [])

    async function downloadPngFromUrl() {
        setDownloadPending(true)
        const { pngUrl } = await fetch(
            `/api/screenshot?tokenId=${tokenId}&width=${width * 2}&height=${height * 2}`,
        ).then((res) => res.json())

        const file = await fetch(pngUrl).then((res) => res.blob())
        const fileUrl = URL.createObjectURL(file)

        const a = document.createElement('a')
        a.href = fileUrl
        a.download = `${name}.png`
        a.click()
        setDownloadPending(false)
    }

    return (
        <Stack fill="horizontal" className="main-stack">
            <Box height="100vh" className="zoom" justify="center" background="backgroundDark" />

            <Box pad={isMobile ? 'none' : 'medium'}>
                <Box
                    background="backgroundLight"
                    round={isMobile ? 'none' : 'small'}
                    pad="small"
                    direction="row"
                    gap="large"
                    flex
                    style={{ minHeight: '100vh' }}
                >
                    <PlusBorder contentContainer={contentContainer} />
                    <Box
                        margin="small"
                        fill
                        gap="large"
                        className="content-container"
                        style={{ minHeight: '100vh' }}
                        justify="between"
                    >
                        <Box gap="large">
                            <Box align="center">
                                <Head>
                                    <title>{name}</title>
                                    <meta property="og:title" content={name} />
                                    <meta property="og:description" content={description} />
                                    <meta property="og:image" content={clickableIPFSLink(image)} />
                                    <meta name="twitter:title" content={name} />
                                    <meta name="twitter:description" content={description} />
                                    <meta name="twitter:image" content={clickableIPFSLink(image)} />
                                    <meta name="twitter:image:alt" content={name} />
                                </Head>
                                <Box border={{ color: 'brand', size: 'small' }} width="60vw">
                                    <Image src={clickableIPFSLink(image)} alt={name} height="100%" />
                                </Box>
                            </Box>
                            <Box
                                direction={isMobile ? 'column' : 'row'}
                                gap="medium"
                                fill="horizontal"
                                justify="center"
                            >
                                <Button
                                    secondary
                                    label="View on OpenSea"
                                    onClick={() => window.open(getOpenSeaUrl(tokenId.toString()))}
                                />
                                <Button
                                    secondary
                                    label={downloadPending ? `Downloading...` : `Download`}
                                    onClick={() => downloadPngFromUrl()}
                                />
                            </Box>
                            <Card pad="medium" background="#d1d1d1">
                                <CardBody gap="medium">
                                    <Text textAlign="center" weight="bold">
                                        Now that you’ve minted your Logbook, you have access to $5,000 USDC worth of
                                        bounties to help better interpret on-chain activity. Check out our Contributor
                                        docs!
                                    </Text>
                                    <Box>
                                        <Button
                                            primary
                                            label="Contribute"
                                            target="_blank"
                                            href="https://github.com/metagame-xyz/evm-translator/blob/main/CONTRIBUTE.md"
                                        />
                                    </Box>
                                </CardBody>
                            </Card>
                        </Box>

                        <Footer />
                    </Box>
                    <PlusBorder contentContainer={contentContainer} />
                </Box>
            </Box>
        </Stack>
    )
}

export default LogbookPage
