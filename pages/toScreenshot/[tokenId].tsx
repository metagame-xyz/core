import { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'

// import Image from 'next/image'
import { Box, Button, Image } from 'grommet'

import { LOGBOOK_CONTRACT_ADDRESS } from 'utils/constants'
import { clickableIPFSLink } from 'utils/frontend'
import { getSize } from 'utils/generateSvg'
import logbookMongoose from 'utils/logbookMongoose'

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
    const { name, tokenId, image, description } = metadata

    const { width, height } = getSize(metadata)

    return (
        <Box>
            <Image src={clickableIPFSLink(image)} alt={name} width={width * 2} height={height * 2} />
        </Box>
    )
}

export default LogbookPage
