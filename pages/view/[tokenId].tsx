import { InferGetServerSidePropsType } from 'next'

import { Box } from '@chakra-ui/react'

import { ioredisClient } from 'utils'
import { Metadata } from 'utils/metadata'

export const getServerSideProps = async (context) => {
    const { tokenId } = context.query
    const metadata = await ioredisClient.hget(tokenId, 'metadata')
    return {
        props: {
            metadata,
            tokenId,
        },
    }
}

function View({ tokenId, metadata: metadataStr }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const metadata = JSON.parse(metadataStr)

    return <Box h="100vh" w="100vw"></Box>
}

export default View
