import type { NextApiRequest, NextApiResponse } from 'next'

import { AddressZ, getEntries } from 'evm-translator'
import _ from 'lodash'

import { validateLlamaPfpAllowList } from 'api/premintCheck/checks/llama'

import { getLlamaUserData, layerItemRowsToAssetData, llamaCriteriaMap, PROJECT_NAME } from 'utils/llama'
import nftMongoose from 'utils/nftDatabase'

import { allRows, nonModifiableCategories, zIndexMap } from './assetData'

const token = ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // const address = req.query.address as string
        const jwt = (req.query.jwt || token) as string
        const llamaUserId = req.query.llamaUserId as string

        let llamaData = null
        let address = null
        try {
            llamaData = await getLlamaUserData(llamaUserId, jwt)
            address = AddressZ.parse(llamaData.eth_login_address)
        } catch (e) {
            if (e.status === 401) {
                return res.status(401).json({ error: 'Unauthorized' })
            } else {
                console.log('Error!')
                console.log(e.status)
                return res.status(500).json({ error: 'Internal Server Error', message: e.message })
            }
        }

        if (!llamaData) {
            return res.status(404).json({ error: 'Llama user not found' })
        }

        console.log('llamaData', llamaData)

        const assetData = layerItemRowsToAssetData(allRows, llamaData, llamaCriteriaMap)

        // get all existing NFT Metdata
        const nftMetadataArr = await nftMongoose.getAllNftMetadataByProject(PROJECT_NAME)
        const existingNftMetadata = nftMetadataArr.find((metadata) => metadata.address === address)
        const otherNftMetadata = nftMetadataArr.filter((metadata) => metadata.address !== address)

        const usedNonModifiableCombos = []
        for (const metadata of otherNftMetadata) {
            // get the names of all non-modifiable layers and concat them into a string
            usedNonModifiableCombos.push(
                getEntries(metadata.layers)
                    .filter(([category]) => nonModifiableCategories.includes(category))
                    .sort(([categoryA], [categoryB]) => zIndexMap[categoryA] - zIndexMap[categoryB])
                    .reduce((acc, [category, name]) => `${acc} ${category}:${name}`, '')
                    .trim(),
            )
        }

        // concat all non-modifiable categories' names into a single array, sorted by the layer order

        const checkResponse = await validateLlamaPfpAllowList(address, jwt, llamaUserId)

        return res.status(200).json({ assetData, checkResponse, usedNonModifiableCombos, existingNftMetadata })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
}
