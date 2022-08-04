import React from 'react'

import { Box, Button, Image, Layer, Text } from 'grommet'
import { Close } from 'grommet-icons'

const LgbkLayer = ({ show = false, close = (a) => a, ...props }) => (
    <>
        {show && (
            <Layer
                id="Metabot"
                position="center"
                onClickOutside={close}
                onEsc={close}
                background="backgroundLight"
                responsive
            >
                <Box alignSelf="end" margin="medium">
                    <Button icon={<Close size="medium" />} hoverIndicator onClick={close} />
                </Box>
                <Box
                    width="medium"
                    height="medium"
                    round="large"
                    justify="center"
                    align="center"
                    pad="medium"
                    gap="medium"
                >
                    {props.children}
                </Box>
            </Layer>
        )}
    </>
)

export default LgbkLayer
