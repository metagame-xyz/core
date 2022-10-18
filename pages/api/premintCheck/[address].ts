import type { NextApiRequest, NextApiResponse } from 'next'

import { ethers } from 'ethers'

import { CheckResponse } from 'utils/premint'

import { validateLogbookAllowList } from './checks/logbook'

const enum CheckType {
    logbook = 'logbook',
    nomadWhitehat = 'nomadWhitehat',
    fosterContributor = 'fosterContributor',
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const address = req.query.address as string
        const check = req.query.check as string

        const response: CheckResponse = {
            valid: false,
            signature: null,
            data: {},
        }

        if (check === CheckType.logbook) {
            const { allowlist, signature } = await validateLogbookAllowList(address)
            response.valid = allowlist
            response.signature = signature
        } else if (check === CheckType.fosterContributor) {
            // TODO: implement
        }

        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}
