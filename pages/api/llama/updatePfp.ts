import type { NextApiRequest, NextApiResponse } from 'next'

import { createCanvas, loadImage } from 'canvas'
import { AssetData, LayerItemData } from 'types'

import { getLlamaUserData, layerItemRowsToAssetData, llamaCriteriaMap } from 'utils/llama'

import { allRows } from './assetData'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        /**
         * During development, it's useful to un-comment this block
         * so you can test some of your code by just hitting this page locally
         *
         */

        const minterAddress = '0x3B3525F60eeea4a1eF554df5425912c2a532875D'
        const tokenId = '1'

        const metadata = {}
        res.setHeader('Content-Type', 'application/json')
        return res.status(200).send(metadata)
    }

    type RequestedPfpLayers = { category: string; name: string }[]

    /**
     * This is the POST API you'll hit in two different places:
     * 1. Once the user has signed the mint transaction, but before you submit the transaction
     * 2. When a user is updates their PFP
     *
     * You'll POST to here:
     * core.theMetagame.xyz/api/llama/updatePfp
     * including a body shaped like this:
     *
     */
    const exampleBody: { jwt: string; llamaUserId: string; layers: RequestedPfpLayers } = {
        jwt: 'abc123',
        llamaUserId: 'e209a559-41e8-4e45-b71e-fb10604e0107',
        layers: [
            { category: 'Background', name: 'Sparkly' },
            { category: 'Necklace', name: 'Green' },
            { category: 'Body', name: 'Brown' },
            { category: 'Mouth Accessory', name: 'Nose Ring' },
            { category: 'Glasses', name: 'Purple Flat Glasses' },
            { category: 'ears', name: 'Purple Headset' },
            { category: 'eyes', name: 'Open' },
        ],
    }

    /****************/
    /*     AUTH     */
    /****************/
    const { jwt, layers, llamaUserId } = req.body

    // use JWT to get Address, ENS, etc from llama backend

    let incomingUserData = null
    try {
        incomingUserData = await getLlamaUserData(llamaUserId, jwt)
    } catch (e) {
        if (e.status === 401) {
            return res.status(401).json({ error: 'Unauthorized' })
        } else {
            console.log('Error!')
            console.log(e.status)
        }
    }

    if (!incomingUserData) {
        return res.status(404).json({ error: 'Llama user not found' })
    }

    // check if this user is allowed to use the layers they've requested
    const assetData = layerItemRowsToAssetData(allRows, incomingUserData, llamaCriteriaMap)

    const getLayer = (assetData: AssetData, layer: { category: string; name: string }): LayerItemData | undefined => {
        return assetData
            .find((asset) => asset.category === layer.category)
            ?.options.find((option) => option.name === layer.name && option.earned !== false)
    }

    for (const layer of layers) {
        const matchingAsset = getLayer(assetData, layer)

        if (!matchingAsset) {
            return res.status(400).json({ error: 'Invalid layer' })
        }
    }

    // generate the multi-layer image using canvas

    const canvas = createCanvas(2400, 2400)
    const ctx = canvas.getContext('2d')

    for (const layer of layers) {
        const matchingAsset = getLayer(assetData, layer)
        if (matchingAsset) {
            const image = await loadImage(matchingAsset.pngLink)
            ctx.drawImage(image, 0, 0, 2400, 2400)
        }
    }

    // return res.send(canvas.toBuffer('image/png'))
    return res.status(200).json({ image: canvas.toDataURL() })

    // upload the image to IPFS, return hash

    // generate the metadata

    // save the layers to the Metagame database

    // return res.status(200).send({updated: true})
}
