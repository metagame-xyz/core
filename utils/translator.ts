import Translator, { chains } from 'evm-translator'

import { ALCHEMY_PROJECT_ID, ETHERSCAN_API_KEY, EVM_TRANSLATOR_CONNECTION_STRING } from 'utils/constants'

export default async function getTranslator(address: string | null = null, networkId = 1): Promise<Translator> {
    const chain = Object.values(chains).find((chain) => chain.id === networkId)

    const translator = new Translator({
        chain,
        alchemyProjectId: ALCHEMY_PROJECT_ID,
        etherscanAPIKey: ETHERSCAN_API_KEY,
        connectionString: EVM_TRANSLATOR_CONNECTION_STRING,
        etherscanServiceLevel: 5,
        userAddress: address,
    })

    if (address) translator.updateUserAddress(address)

    await translator.initializeMongoose()

    return translator
}
