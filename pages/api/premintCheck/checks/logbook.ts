import { ethers } from 'ethers'

import { LOGBOOK_CONTRACT_ADDRESS } from 'utils/constants'
import { createDomainSeparator, generateSignature } from 'utils/premint'

export const logbookDomainSeparator = createDomainSeparator('Metagame Logbook', LOGBOOK_CONTRACT_ADDRESS)

export type ValidateLogbookResponse = {
    allowlist: boolean
    signature: ethers.Signature | null
}

export const validateLogbookAllowList = async (address: string): Promise<ValidateLogbookResponse> => {
    // await mongoose.connect()

    const user = null // await mongoose.getUserByEthAddress(address)

    const returnVal: ValidateLogbookResponse = {
        allowlist: false,
        signature: null,
    }

    if (user) {
        returnVal.allowlist = true
        returnVal.signature = await generateSignature(address, logbookDomainSeparator)
    }

    return returnVal
}
