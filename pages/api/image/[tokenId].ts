import type { NextApiRequest, NextApiResponse } from 'next'

import generateSvg from 'utils/generateSvg'
import logbookMongoose from 'utils/logbookMongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const tokenId = req.query.tokenId as string

    const metadata = await logbookMongoose.getMetadataForTokenId(tokenId)

    if (!metadata) {
        return res.status(404).send({ message: `Image for token id ${tokenId} not found.` })
    }

    const svgString = generateSvg(metadata)

    const svgBuffer = Buffer.from(svgString, 'utf-8')
    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(svgBuffer)
}
