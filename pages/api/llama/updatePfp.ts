import type { NextApiRequest, NextApiResponse } from 'next'

import { createCanvas, loadImage } from 'canvas'
import { AddressZ, getEntries } from 'evm-translator'
import { AssetData, LayerItemData } from 'types'
import { IncomingLlamaUserData } from 'types/llama'

import { addToIpfsFromBuffer } from 'utils/ipfs'
import { getLlamaUserData, layerItemRowsToAssetData, llamaCriteriaMap, PROJECT_NAME } from 'utils/llama'
import { NftMetadata } from 'utils/models'
import nftMongoose from 'utils/nftDatabase'

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
    const { jwt, layers, llamaUserId } = req.body as { jwt: string; llamaUserId: string; layers: RequestedPfpLayers }

    // use JWT to get Address, ENS, etc from llama backend

    let incomingUserData: IncomingLlamaUserData = null
    let incomingAddress = null
    try {
        incomingUserData = await getLlamaUserData(llamaUserId, jwt)
        incomingAddress = AddressZ.parse(incomingUserData.eth_login_address)
    } catch (e) {
        if (e.status === 401) {
            return res.status(401).json({ error: 'No valid LlamaDAO JWT. Unauthorized' })
        } else {
            console.log('Error!')
            console.log(e.status)
        }
    }

    if (!incomingUserData) {
        return res.status(404).json({ error: 'Llama user not found' })
    }

    const assetData = layerItemRowsToAssetData(allRows, incomingUserData, llamaCriteriaMap)

    const getLayer = (assetData: AssetData, layer: { category: string; name: string }): LayerItemData | undefined => {
        return assetData
            .find((asset) => asset.category === layer.category)
            ?.options.find((option) => option.name === layer.name && option.earned !== false)
    }

    for (const layer of layers) {
        const matchingAsset = getLayer(assetData, layer)

        if (!matchingAsset) {
            return res.status(400).json({ error: `Invalid layer. Either it doesn't exist or you haven't earned it` })
        }
    }

    /* check if this user is allowed to use the layers they've requested * /

    /* get all none-modifiable categories */
    const nonModifiableCategories = allRows
        .filter((row) => row.modifiable === false)
        .reduce((acc, row) => {
            const uniques = acc.includes(row.category) ? acc : [...acc, row.category]
            return uniques
        }, [])

    /* get metadata for all existing tokenIDs / Addresses */
    const metadataArr = await nftMongoose.getAllNftMetadataByProject(PROJECT_NAME)

    /* find the metadata that is using all of the same layers for nonModifiable categories. (if it's null, then they're allowed to use the layers) */
    const matchingMetadata = metadataArr.find((metadata) => {
        // filter attributes to only nonModifiable categories

        const nonModifiableLayers = getEntries(metadata.layers).filter(([key]) => {
            return nonModifiableCategories.includes(key)
        })

        // check if all nonModifiable categories are the same
        return nonModifiableLayers.every(([key, value]) => {
            const matchingLayer = layers.find((layer) => layer.category === key)
            return matchingLayer && matchingLayer.name === value
        })
    })

    // const matchingMetadata = null
    console.log('matchingMetadata', matchingMetadata)

    console.log('incomingUserData.eth_login_address', incomingAddress)
    // if it's not this user's metadata, then they're not allowed to use the layers
    if (matchingMetadata && matchingMetadata.address !== incomingAddress) {
        // if (matchingMetadata && matchingMetadata.address !== '0x95155452e617a059b6b0c8af433032d554b03929') {
        return res
            .status(400)
            .json({ error: `This configuration already in use by address: ${matchingMetadata.address}` })
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

    // upload the image to IPFS, return hash
    const ipfsUrl = await addToIpfsFromBuffer(canvas.toBuffer('image/png'))

    const metadata: NftMetadata = {
        project: PROJECT_NAME,
        image: ipfsUrl,
        name: `${incomingUserData.username}'s Llama`,
        address: incomingAddress,
        // address: '0x95155452e617a059b6b0c8af433032d554b03929',
        description: `A Llama created by ${incomingUserData.username}. Llamas are only available to Contributors to Llama DAO. Some traits are chosen, some are earned. ${incomingUserData.username} is a ${incomingUserData.tier} within Llama DAO.`,
        layers: layers.reduce((acc, layer) => {
            acc[layer.category] = layer.name
            return acc
        }, {}) as Record<string, string>,
        extra: {
            tier: incomingUserData.tier,
            username: incomingUserData.username,
        },
        timestamp: new Date().toISOString(),
    }

    // add back the tokenId if it exists
    if (matchingMetadata) metadata.tokenId = matchingMetadata.tokenId

    // save the metadata to the Metagame database
    let savedMetadata
    if (JSON.stringify(metadata.layers) !== JSON.stringify(matchingMetadata.layers)) {
        savedMetadata = await nftMongoose.createNftMetadata(metadata)
    }

    return res.status(200).json({
        ipfsUrl,
        metadata,
        savedMetadata,
        // image: canvas.toDataURL(),
    })
    // return res.status(200).send({updated: true})
}
