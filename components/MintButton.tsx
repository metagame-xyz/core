import React, { useEffect, useState } from 'react'

import { Button } from 'grommet'

export const enum MintStatus {
    unknown = 'unknown',
    loading = 'loading',
    can_mint = 'Mint',
    minting = 'Minting...',
    minted = 'Minted',
    metabot = 'DM Metabot',
    processing = 'Processing...',
}

const MintButton = ({ mintStatus, clickable, action }) => {
    const [actionLabel, setActionLabel] = useState<string>(mintStatus)

    useEffect(() => {
        setActionLabel(mintStatus)
    }, [mintStatus])

    console.log('mintStatus', mintStatus)
    console.log('actionLabel', actionLabel)

    return (
        <div
            onMouseEnter={() => clickable && setActionLabel(`> ${mintStatus} <`)}
            onMouseLeave={() => setActionLabel(mintStatus)}
            style={{ width: '100%' }}
        >
            <Button
                onClick={action}
                size="large"
                primary
                disabled={!clickable}
                label={actionLabel}
                style={{ width: '100%' }}
            />
        </div>
    )
}

export default MintButton
