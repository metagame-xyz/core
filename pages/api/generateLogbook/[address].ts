import { NextApiRequest, NextApiResponse } from 'next'

import { AddressZ, timer } from 'evm-translator'
import { addressToName } from 'onoma'

import { WEBSITE_URL } from 'utils/constants'
import createSentences from 'utils/createSentences'
import generateSvg from 'utils/generateSvg'
import { addToIpfsFromSvgStr } from 'utils/ipfs'
import logbookMongoose from 'utils/logbookMongoose'
import { LogData, logError, logSuccess } from 'utils/logging'
import metabotMongoose from 'utils/metabot'
import { NftMetadata } from 'utils/models'
import getTranslator from 'utils/translator'

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

        logData.third_party_name = 'metabotMongoose'
        // timer.startTimer(logData.third_party_name)
        await metabotMongoose.connect()
        const user = await metabotMongoose.getUserByEthAddress(address)
        // timer.stopTimer(logData.third_party_name)

        if (!(user?.txHashList?.length > 0)) {
            throw new Error('No txHashList, or empty txHashList')
        }

        logData.third_party_name = 'evm-translator'
        // timer.startTimer('getTranslator')
        const translator = await getTranslator(address)
        // timer.stopTimer('getTranslator')

        timer.startTimer('getTxHashFromDB')
        const decodedTx = await translator.getManyDecodedTxFromDB(user.txHashList)
        timer.stopTimer('getTxHashFromDB')

        timer.startTimer('interpretTxArr')
        const interpretedData = await translator.interpretDecodedTxArr(decodedTx, address)
        timer.stopTimer('interpretTxArr')

        // debugger

        logData.third_party_name = 'createSentences'
        const { sentences, actions, nftMintNames, unknownTxs, reverted, paidByFwb } = createSentences(interpretedData)

        const userName = user.ens || addressToName(user.address)

        const nftMetadata: NftMetadata = {
            name: `${userName}'s Logbook`,
            description: 'A compilation of all the transactions this address has been involved in',
            image: `https://${WEBSITE_URL}/printing.png`,
            externalUrl: `https://logbook.themetagame.xyz/logbook/${user.address}`,
            address: user.address,
            userName,
            sentences,
            lastUpdated: new Date(),
        }

        logData.third_party_name = 'generateSvg'
        const svgString = generateSvg(nftMetadata)

        logData.third_party_name = 'ipfs'
        // timer.startTimer('addToIpfsFromSvgStr')
        const ipfsUrl = await addToIpfsFromSvgStr(svgString)
        // timer.stopTimer('addToIpfsFromSvgStr')

        nftMetadata.image = ipfsUrl

        logData.third_party_name = 'logbookMongoose'
        // timer.startTimer('logbookMongoose.addOrUpdateNftMetadata')
        await logbookMongoose.connect()
        await logbookMongoose.addOrUpdateNftMetadata(nftMetadata)
        // timer.startTimer('logbookMongoose.addOrUpdateNftMetadata')

        // const todo = data.______TODO______.filter((tx) => tx.toName !== 'OPENSEA')

        // delete data['______TODO______']

        logData.extra = { sentences: sentences.length }

        logSuccess(logData)

        // const svgBuffer = Buffer.from(svgString, 'utf-8')
        // res.setHeader('Content-Type', 'image/svg+xml')
        // res.send(svgBuffer)

        res.status(200).json({
            // actions,
            paidByFwb,
            sentences,
            nftMintNames,
            // unknownTxs,
            reverted,
        })
    } catch (err: any) {
        logError(logData, err)
        res.status(500).json({ statusCode: 500, message: err.message })
    }
}

export default handler
