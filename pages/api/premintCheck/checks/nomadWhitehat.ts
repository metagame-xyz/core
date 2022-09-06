import { chains } from 'evm-translator'
import Interpreter from 'evm-translator/lib/core/Interpreter'

import { NOMAD_WHITEHAT_CONTRACT_ADDRESS } from 'utils/constants'
import { createDomainSeparator } from 'utils/premint'
import getTranslator from 'utils/translator'

export const NOMAD_EXPLOITED_CONTRACT_ADDRESS = '0x88a69b4e698a4b090df6cf5bd7b2d47325ad30a3'
export const NOMAD_RETURN_CONTRACT_ADDRESS = '0x94a84433101a10aeda762968f6995c574d1bf154'

export interface NomadTxPair {
    hackAmount: number
    returnAmount: number
    symbol: string
}

export interface NomadTxPairs {
    [key: string]: NomadTxPair
}

export interface TokensReturned {
    [key: string]: number
}

export interface ValidateWhitehatResponse {
    whitehat: boolean
    returnedEverything: boolean
    message: string
    tokensReturned: TokensReturned
}

export const whitehatDomainSeparator = createDomainSeparator('Metagame Nomad Whitehat', NOMAD_WHITEHAT_CONTRACT_ADDRESS)

export const validateWhitehat = async (address: string): Promise<ValidateWhitehatResponse> => {
    const response = {
        whitehat: true,
        returnedEverything: true,
        message: 'Valid whitehat hacker',
        tokensReturned: {},
    }

    const user = null //  await mongoose.getUserByEthAddress(address)

    if (!user) {
        response.whitehat = false
        response.returnedEverything = false
        response.message = 'Not in DB'
        return response
    }

    const translator = await getTranslator(address)
    const decodedTxs = await translator.getManyDecodedTxFromDB(user.txHashList) //.filter((tx) => tx.timestamp > 1659379757)
    const interpreter = new Interpreter(chains.ethereum)

    const hackTxs = decodedTxs.filter((tx) => {
        const exploitedContractInteractions = tx.interactions.filter(
            (interaction) => interaction.contractAddress.toLowerCase() === NOMAD_EXPLOITED_CONTRACT_ADDRESS,
        )
        if (tx.methodCall.name === 'process' && exploitedContractInteractions.length) {
            // hack tx
            return true
        }
        return false
    })
    const interpretedHackTxs = await Promise.all(hackTxs.map((tx) => interpreter.interpretSingleTx(tx)))
    const assetsReceived = interpretedHackTxs.reduce(
        (assetsReceived, tx) => [...assetsReceived, ...tx.assetsReceived],
        [],
    )

    const returnTxs = decodedTxs.filter((tx) => {
        const returnTransferEvents = tx.interactions
            .reduce((events, interaction) => [...events, ...interaction.events], [])
            .filter((e) => e.eventName === 'Transfer' && e.params?.to === NOMAD_RETURN_CONTRACT_ADDRESS)
        if (tx.methodCall.name === 'transfer' && returnTransferEvents.length) {
            // return tx
            return true
        }
        return false
    })
    const interpretedReturnTxs = await Promise.all(returnTxs.map((tx) => interpreter.interpretSingleTx(tx)))
    const assetsSent = interpretedReturnTxs.reduce((assetsSent, tx) => [...assetsSent, ...tx.assetsSent], [])

    if (!(hackTxs.length && returnTxs.length)) {
        response.whitehat = false
        response.returnedEverything = false
        response.message = 'Not a whitehat hacker'
        return response
    }

    const txPairs: NomadTxPairs = {}
    assetsReceived.forEach((assetChunk) => {
        const tokenAddress = assetChunk.address
        if (!txPairs[tokenAddress]) {
            txPairs[tokenAddress] = {
                hackAmount: parseFloat(assetChunk.amount),
                returnAmount: 0,
                symbol: assetChunk.symbol,
            }
        } else {
            txPairs[tokenAddress].hackAmount += parseFloat(assetChunk.amount)
        }
    })

    assetsSent.forEach((assetChunk) => {
        const tokenAddress = assetChunk.address
        if (!txPairs[tokenAddress]) return
        txPairs[tokenAddress].returnAmount += parseFloat(assetChunk.amount)
    })

    for (const pair of Object.values(txPairs)) {
        if (pair.hackAmount * 0.9 > pair.returnAmount) {
            response.whitehat = false
            response.returnedEverything = false
            response.message = 'Hacker did not return enough funds'
            response.tokensReturned = {}
            break
        } else if (pair.hackAmount > pair.returnAmount) {
            response.returnedEverything = false
        }
        response.tokensReturned[pair.symbol] = pair.returnAmount
    }

    return response
}
