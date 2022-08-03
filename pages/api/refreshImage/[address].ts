import { NextApiRequest, NextApiResponse } from 'next'

import { AddressZ, timer } from 'evm-translator'

import generateSvg from 'utils/generateSvg'
import { addToIpfsFromSvgStr } from 'utils/ipfs'
import logbookMongoose from 'utils/logbookMongoose'
import { LogData, logError, logSuccess } from 'utils/logging'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    let address = _req.query.address as string

    const logData: LogData = {
        function_name: 'generateLogbook',
        message: `begin`,
        wallet_address: address,
    }

    try {
        logData.third_party_name = 'zod'
        address = AddressZ.parse(address)
        logData.wallet_address = address

        logData.third_party_name = 'logbookMongoose'
        await logbookMongoose.connect()
        const nftMetadata = await logbookMongoose.getMetadataForAddress(address)

        logData.third_party_name = 'generateSvg'
        const svgString = generateSvg(nftMetadata)

        logData.third_party_name = 'ipfs'
        timer.startTimer('addToIpfsFromSvgStr')
        const ipfsUrl = await addToIpfsFromSvgStr(svgString)
        timer.stopTimer('addToIpfsFromSvgStr')

        nftMetadata.image = ipfsUrl
        nftMetadata.externalUrl = `https://logbook.themetagame.xyz/logbook/${nftMetadata.address}`

        logData.third_party_name = 'logbookMongoose'
        timer.startTimer('logbookMongoose.addOrUpdateNftMetadata')
        await logbookMongoose.addOrUpdateNftMetadata(nftMetadata)
        timer.startTimer('logbookMongoose.addOrUpdateNftMetadata')

        logSuccess(logData)
        res.status(200).json({
            status: 'success',
            data: {
                ipfsUrl,
            },
        })
    } catch (err: any) {
        logError(logData, err)
        res.status(500).json({ statusCode: 500, message: err.message })
    }
}

export default handler
