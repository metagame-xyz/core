import { AddressZ } from 'evm-translator'
import { IncomingLlamaUserData } from 'types/llama'

import { getLlamaUserData, PROJECT_NAME } from 'utils/llama'
import { CheckResponse, createDomainSeparator, generateSignature } from 'utils/premint'

const llamaPfpDomainSeparator = createDomainSeparator(PROJECT_NAME, '0x17a059b6b0c8af433032d554b0392995155452e6') // TODO add a contract address

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
        incomingUserData = await getLlamaUserData(llamaUserId, jwt)
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
