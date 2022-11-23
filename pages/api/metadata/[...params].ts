import type { NextApiRequest, NextApiResponse } from 'next'

import nftDatabase from 'utils/nftDatabase'
import { metadataToOpenSeaMetadata } from 'utils/opensea'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { params } = req.query
    const project: string = params[0]
    const tokenId: string = params[1]

    try {
        const nftMetadata = await nftDatabase.getNftMetadataByProjectAndTokenId(project, tokenId)
        if (!nftMetadata) {
            return res.status(404).json({ message: 'Not found' })
        }

        return res.status(200).json(metadataToOpenSeaMetadata(nftMetadata))
    } catch (err) {
        console.error('mongoose getNftMetadataByProjectAndTokenId error', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
