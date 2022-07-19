import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers, Signer, Wallet } from 'ethers'
import logbookMongoose from 'utils/logbookMongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let { address, tokenId } = req.body
        address = Array.isArray(address) ? '' : address

        await logbookMongoose.connect()

        await logbookMongoose.addTokenIdForAddress(address, tokenId)

        res.status(200).json("success")
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}
