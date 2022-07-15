import type { NextApiRequest, NextApiResponse } from 'next'

import { getUserName } from 'utils'
import { LogData, logError } from 'utils/logging'
import { formatNewMetadata, getTxnData, Metadata, metadataToOpenSeaMetadata, TxnCounts } from 'utils/metadata'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { address } = req.query as { address: string }

    const logData: LogData = {
        level: 'info',
        token_id: null,
        function_name: 'addOrUpdateNft',
        message: `begin`,
        wallet_address: address,
    }

    /*********************/
    /* DRAFT OF METADATA */
    /*********************/

    let metadata: Metadata
    try {
        const userName = await getUserName(address)
        metadata = formatNewMetadata(address, userName, '1')
    } catch (error) {
        console.log(error)
        logError(logData, error)
    }

    const OpenSeaMetadata = metadataToOpenSeaMetadata(metadata)

    const returnData = {
        metadata,
        OpenSeaMetadata,
    }

    res.send(returnData)
    // res.send({ test: 'test', txnCounts });
}
