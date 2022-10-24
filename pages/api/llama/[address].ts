import type { NextApiRequest, NextApiResponse } from 'next'

import { AddressZ } from 'evm-translator'
import _ from 'lodash'

import { validateLlamaPfpAllowList } from 'api/premintCheck/checks/llama'

import { getLlamaUserData, layerItemRowsToAssetData, llamaCriteriaMap } from 'utils/llama'

import { allRows } from './assetData'

const token = ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // const address = req.query.address as string
        const authToken = (req.query.jwt || token) as string
        const llamaUserId = req.query.llamaUserId as string

        let llamaData = null
        try {
            llamaData = await getLlamaUserData(llamaUserId, authToken)

            console.log('llamaData', llamaData)
        } catch (e) {
            if (e.status === 401) {
                return res.status(401).json({ error: 'Unauthorized' })
            } else {
                console.log('Error!')
                console.log(e.status)
            }
        }

        if (!llamaData) {
            return res.status(404).json({ error: 'Llama user not found' })
        }

        console.log('llamaData', llamaData)

        const parseData = AddressZ.safeParse(llamaData.eth_login_address)
        const address = parseData.success ? parseData.data : null

        const assetData = layerItemRowsToAssetData(allRows, llamaData, llamaCriteriaMap)
        const checkResponse = await validateLlamaPfpAllowList(address)

        // TODO: get this from the Metatgame database
        // const userData: UserData = {

        return res.status(200).json({ assetData, checkResponse })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
}
