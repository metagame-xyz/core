import type { NextApiRequest, NextApiResponse } from 'next'

import OpenseaForceUpdate from 'api/queues/openseaForceUpdate'

import logbookMongoose from 'utils/logbookMongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { tokenId } = req.query as { tokenId: string }

    const metadata = await logbookMongoose.getMetadataForTokenId(tokenId)

    if (!metadata) {
        return res.status(404).json({ message: `Token id ${tokenId} not found.` })
    }

    const jobData = await OpenseaForceUpdate.enqueue(
        {
            tokenId,
            attempt: 1,
            newImageUrl: metadata.image,
        },
        { id: tokenId, override: true },
    )
    res.send(jobData)
    // res.send({});
}
