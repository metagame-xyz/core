import React from 'react'

import { Box, Text } from 'grommet'

const PlusBorder = ({ contentContainer }) => (
    <Box
        align="center"
        height={`${contentContainer ? contentContainer.clientHeight : 0}px`}
        style={{ overflowY: 'hidden' }}
    >
        {[...Array(100).keys()].map((i) => (
            <Text key={i} color="brand">
                +
            </Text>
        ))}
    </Box>
)

export default PlusBorder
