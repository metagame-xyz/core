import type { NextApiRequest, NextApiResponse } from 'next'

import logbookMongoose from 'utils/logbookMongoose'
import { metadataToOpenSeaMetadata } from 'utils/metadata'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { tokenId } = req.query as { tokenId: string }

    const metadata = await logbookMongoose.getMetadataForTokenId(tokenId)

    if (!metadata) {
        return res.status(404).json({ message: `Token id ${tokenId} not found.` })
    }

    const openseaMetadata = metadataToOpenSeaMetadata(metadata)
    res.send(openseaMetadata)
}
