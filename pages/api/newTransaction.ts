import type { NextApiRequest, NextApiResponse } from 'next'

import { LogData, logError, logSuccess } from 'utils/logging'
import withMiddleware from 'utils/middleware'
import nftDatabase from 'utils/nftDatabase'

import OpenseaForceUpdate from './queues/openseaForceUpdate'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { minterAddress, tokenId, contractAddress, nftName: project } = req.body

    const logData: LogData = {
        level: 'info',
        function_name: 'newTransaction',
        message: `begin`,
        token_id: tokenId,
        wallet_address: contractAddress,
        contract_address: contractAddress,
        nft_name: project,
    }

    try {
        await nftDatabase.connect()

        const metadata = await nftDatabase.addTokenIdForAddress(project, minterAddress, tokenId)

        const result = {
            minterAddress: metadata.address,
            tokenId: metadata.tokenId,
            userName: metadata.name,
        }

        const tokenIdStr = String(tokenId)

        try {
            await OpenseaForceUpdate.enqueue(
                {
                    tokenId: tokenIdStr,
                    contractAddress,
                    attempt: 1,
                    newImageUrl: metadata.image,
                },
                { id: contractAddress + tokenIdStr, override: true },
            )
        } catch (error) {
            logError(logData, error)
        }

        logSuccess(logData)
        res.status(200).send({
            status: 1,
            message: 'success',
            result,
        })
    } catch (error) {
        logError(logData, error)

        res.status(500).json({ error: error.message })
    }
}

export default withMiddleware('eventForwarderAuth')(handler)
