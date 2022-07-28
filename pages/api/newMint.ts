import type { NextApiRequest, NextApiResponse } from 'next'

import logbookMongoose from 'utils/logbookMongoose'
import withMiddleware from 'utils/middleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { address, tokenId } = req.body

        await logbookMongoose.connect()

        await logbookMongoose.addTokenIdForAddress(address, tokenId)

        res.status(200).json('success')
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}

export default withMiddleware('eventForwarderAuth')(handler)
