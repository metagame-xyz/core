import { useContext } from 'react'

import { Anchor, Box, ResponsiveContext, Stack, Text } from 'grommet'

import { Etherscan, Opensea, TwelveCircles, Twitter } from './Icons'

const hover = { color: 'brand.300' }

export default function Footer(props) {
    const isMobile = useContext(ResponsiveContext) === 'small'

    return (
        <Box width="100%" direction="row" justify="stretch" align="center">
            <Box justify="center" align="start" basis="1/2">
                <Box
                    justify="start"
                    align="center"
                    onClick={() => window.open('https://themetagame.xyz', '_blank')}
                    direction={isMobile ? 'column' : 'row'}
                    gap="xsmall"
                >
                    <TwelveCircles />
                    <Text textAlign="center" size="xsmall">
                        Metagame
                    </Text>
                </Box>
            </Box>
            <Box direction="row" align="center" justify="end" gap="xsmall" basis="1/2">
                <Twitter boxSize={[6, 8]} _hover={hover} boxShadow={''} />
                <Opensea boxSize={[6, 8]} _hover={hover} boxShadow={''} />
                <Etherscan boxSize={[6, 8]} _hover={hover} boxShadow={''} />
            </Box>
        </Box>
    )
}
