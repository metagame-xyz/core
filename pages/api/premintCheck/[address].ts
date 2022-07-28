import type { NextApiRequest, NextApiResponse } from 'next'

import { Signature } from 'ethers'

import { METABOT_BASE_API_URL } from 'utils/constants'
import logbookMongoose from 'utils/logbookMongoose'
import { LogData, logError, logSuccess } from 'utils/logging'
import { fetcher } from 'utils/requests'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const address = req.query.address as string

    const logData: LogData = {
        function_name: 'premintCheck',
        message: `begin`,
        wallet_address: address,
    }
    try {
        type PremintCheckResponse = {
            allowlist: boolean
            signature: Signature | null
        }

        logData.third_party_name = 'metabot'

        const { allowlist, signature } = (await fetcher(
            `${METABOT_BASE_API_URL}premintCheck/${address}`,
        )) as PremintCheckResponse

        const response = {
            allowlist,
            signature,
            errorCode: null,
            message: null,
        }

        if (!allowlist) {
            response.message = 'User is not on mint whitelist'
            response.errorCode = 1
            return res.status(200).json(response)
        }

        const metadata = await logbookMongoose.getMetadataForAddress(address)

        if (!metadata) {
            response.message = 'data not yet generated for user'
            response.errorCode = 2
        }

        logSuccess(logData, response.message || 'success')
        return res.status(200).json(response)
    } catch (error) {
        logError(logData, error)
        res.status(500).json({ error: error.message })
    }
}
