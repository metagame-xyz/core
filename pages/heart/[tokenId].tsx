import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button } from '@chakra-ui/react';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';

import { ioredisClient } from '@utils';
import { CONTRACT_ADDRESS } from '@utils/constants';
import { clickableIPFSLink } from '@utils/frontend';
import { Metadata } from '@utils/metadata';

export const getServerSideProps = async (context) => {
    const { tokenId } = context.query;
    const metadata = await ioredisClient.hget(tokenId, 'metadata');
    return {
        props: {
            metadata,
            tokenId,
        },
    };
};

function HeartPage({
    tokenId,
    metadata: metadataStr,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const keysToKeep = ['name', 'description', 'address'];

    const getOpenSeaUrl = (tokenId: string) => {
        return `https://opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`;
    };

    const metadata: Metadata = JSON.parse(metadataStr);
    const attributes = (metadata: Metadata) => {
        return (
            <>
                {Object.entries(metadata)
                    .filter(([v, k]) => keysToKeep.includes(v))
                    .map(([key, value]) => {
                        console.log('key', key);
                        console.log('value', value);
                        return (
                            <>
                                <p key={key}>
                                    {key}: {value}
                                </p>
                            </>
                        );
                    })}
            </>
        );
    };
    const size = ['80vw'];
    return (
        <Box p="16px" minH="calc(100vh - 146px)" w="auto">
            <Head>
                <title>{metadata.name}</title>
                <meta property="og:title" content={metadata.name} />
                <meta property="og:description" content={metadata.description} />
                <meta property="og:image" content={clickableIPFSLink(metadata.image)} />
                <meta name="twitter:title" content={metadata.name} />
                <meta name="twitter:description" content={metadata.description} />
                <meta name="twitter:image" content={clickableIPFSLink(metadata.image)} />
                <meta name="twitter:image:alt" content={metadata.name} />
            </Head>
            <Box w={size} h={size} maxW="800px" maxH="800px"></Box>
            <Box>
                <Button
                    colorScheme="brand"
                    my={4}
                    size="lg"
                    boxShadow="lg"
                    fontSize="2xl"
                    bg="brand.700"
                    rightIcon={<ExternalLinkIcon />}
                    onClick={() => window.open(getOpenSeaUrl(tokenId))}>
                    View on OpenSea
                </Button>
            </Box>
        </Box>
    );
}

export default HeartPage;
