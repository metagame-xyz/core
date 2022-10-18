import { CheckResponse, createDomainSeparator, generateSignature } from 'utils/premint'

const llamaPfpDomainSeparator = createDomainSeparator('Llama PFP', '0xCONTRACT_ADDRESS') // TODO add a contract address

export const validateLlamaPfpAllowList = async (address: string, llamaJwt: string): Promise<CheckResponse> => {
    const returnVal: CheckResponse = {
        valid: false,
        signature: null,
    }

    // await get llama user data from_api(address, llamaJwt)
    // if data
    returnVal.valid = true
    returnVal.signature = await generateSignature(address, llamaPfpDomainSeparator)

    return returnVal
}
