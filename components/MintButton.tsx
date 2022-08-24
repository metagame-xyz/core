import React, { useEffect, useState } from 'react'

import { Button } from '@chakra-ui/react'

export const enum MintStatus {
    unknown = 'unknown',
    loading = 'Loading...',
    can_mint = 'Mint for some ETH',
    minting = 'Minting...',
    minted = 'See your NFT',
    metabot = 'Get allowlisted',
    processing = 'Processing...',
}

const MintButton = ({ mintStatus, clickable, action = (a) => a }) => {
    const [actionLabel, setActionLabel] = useState<string>(mintStatus)

    useEffect(() => {
        setActionLabel(mintStatus)
    }, [mintStatus])

    return (
        <div
            onMouseEnter={() => clickable && setActionLabel(`> ${mintStatus} <`)}
            onMouseLeave={() => setActionLabel(mintStatus)}
            style={{ width: '100%' }}
        >
            <Button onClick={action} size="large" disabled={!clickable} style={{ width: '100%' }}>
                {actionLabel}
            </Button>
        </div>
    )
}

export default MintButton
