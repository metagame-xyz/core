import { AddressZ } from 'evm-translator'
import { IncomingLlamaUserData } from 'types/llama'

import { LLAMA_PFP_CONTRACT_ADDRESS } from 'utils/constants'
import { getLlamaUserData, LLAMA_PROJECT_NAME } from 'utils/llama'
import { CheckResponse, createDomainSeparator, generateSignature } from 'utils/premint'

const llamaPfpDomainSeparator = createDomainSeparator(LLAMA_PROJECT_NAME, LLAMA_PFP_CONTRACT_ADDRESS)

export const validateLlamaPfpAllowList = async (
    address: string,
    jwt: string,
    llamaUserId: string,
): Promise<CheckResponse> => {
    const returnVal: CheckResponse = {
        valid: false,
        signature: null,
    }

    let incomingUserData: IncomingLlamaUserData = null
    let incomingAddress = null
    try {
        incomingUserData = await getLlamaUserData(llamaUserId, jwt, address)
        incomingAddress = AddressZ.parse(incomingUserData.eth_login_address)
    } catch (e) {
        console.log('Error!')
        console.log(e.status)
    }

    if (incomingAddress) {
        returnVal.valid = true
        returnVal.signature = await generateSignature(address, llamaPfpDomainSeparator)
    }
    return returnVal
}
