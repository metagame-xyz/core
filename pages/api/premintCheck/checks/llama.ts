import { CheckResponse, createDomainSeparator, generateSignature } from 'utils/premint'

export const llamaS3BucketName = 'llama-pfp'

// https://llama-pfp.s3.us-east-1.amazonaws.com/Layers/Background/Blue_-_Pink_-_Orange.png

const llamaPfpDomainSeparator = createDomainSeparator('Llama PFP', '0x17a059b6b0c8af433032d554b0392995155452e6') // TODO add a contract address

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
