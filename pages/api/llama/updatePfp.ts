import type { NextApiRequest, NextApiResponse } from 'next'

import { hashMessage } from '@ethersproject/hash'
import { createCanvas, loadImage } from 'canvas'
import { recoverAddress } from 'ethers/lib/utils'
import { AddressZ, getEntries } from 'evm-translator'
import { AssetData, LayerItemData } from 'types'
import { IncomingLlamaUserData } from 'types/llama'

import { validateLlamaPfpAllowList } from 'api/premintCheck/checks/llama'

import { allowCors } from 'utils/cors'
import { addToIpfsFromBuffer } from 'utils/ipfs'
import { getLlamaUserData, layerItemRowsToAssetData, LLAMA_PROJECT_NAME, llamaCriteriaMap } from 'utils/llama'
import { NftMetadata } from 'utils/models'
import nftMongoose from 'utils/nftDatabase'

import { allRows, nonModifiableCategories } from './assetData'

type RequestedPfpLayers = { category: string; name: string }[]

export type UpdatePfpBody = {
    llamaUserId: string
    requestedLayers: RequestedPfpLayers
    jwt: string
    signature: string
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('updatePfp handler called')
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

    /**
     * This is the POST API you'll hit in two different places:
     * 1. Once the user has signed the mint transaction, but before you submit the transaction
     * 2. When a user updates their PFP
     *
     * You'll POST to here:
     * core.theMetagame.xyz/api/llama/updatePfp
     * including a body shaped like this:
     *
     */
    const exampleBody: UpdatePfpBody = {
        jwt: 'abc123',
        llamaUserId: 'e209a559-41e8-4e45-b71e-fb10604e0107',
        requestedLayers: [
            { category: 'Background', name: 'Sparkly' },
            { category: 'Necklace', name: 'Green' },
            { category: 'Body', name: 'Brown' },
            { category: 'Mouth Accessory', name: 'Nose Ring' },
            { category: 'Glasses', name: 'Purple Flat Glasses' },
            { category: 'ears', name: 'Purple Headset' },
            { category: 'eyes', name: 'Open' },
        ],
        signature: '',
    }

    /****************/
    /*     AUTH     */
    /****************/
    const { jwt, requestedLayers, llamaUserId, signature, userAddress } = req.body as {
        jwt: string
        llamaUserId: string
        requestedLayers: RequestedPfpLayers
        signature: string
        userAddress?: string
    }

    // use JWT to get Address, ENS, etc from llama backend

    if (!jwt || !llamaUserId || !requestedLayers || requestedLayers.length === 0 || !signature) {
        return res.status(400).send('Missing jwt or llamaUserId or requestedLayers or signature')
    }

    let incomingUserData: IncomingLlamaUserData = null
    let incomingAddress = null
    try {
        incomingUserData = await getLlamaUserData(llamaUserId, jwt, userAddress)
        incomingAddress = AddressZ.parse(incomingUserData.eth_login_address)
    } catch (e) {
        if (e.status === 401) {
            return res.status(401).json({ error: 'No valid LlamaDAO JWT. Unauthorized' })
        } else {
            console.log('Error!')
            console.log(e.status)
            return res.status(500).json({ error: 'Internal Server Error', message: e.message })
        }
    }

    if (!incomingUserData) {
        return res.status(404).json({ error: 'Llama user not found' })
    }

    // check if the llama user was the one that requested the update
    const signerAddress = AddressZ.parse(recoverAddress(hashMessage(JSON.stringify(requestedLayers)), signature))
    if (incomingAddress !== signerAddress) {
        return res.status(401).json({ error: 'Invalid signature' })
    }

    const assetData = layerItemRowsToAssetData(allRows, incomingUserData, llamaCriteriaMap)

    /* For each layer in layers, check to make sure it exists in the assetData. if it doesn't, return 400 */
    for (let i = 0; i < requestedLayers.length; i++) {
        const layer = requestedLayers[i]
        const foundLayer = assetData
            .find((asset) => asset.category === layer.category)
            ?.options.find((option) => option.name === layer.name)

        if (!foundLayer) {
            i = requestedLayers.length
            return res.status(400).json({
                error: `Category: ${layer.category}, Name: ${layer.name} is not valid for ${LLAMA_PROJECT_NAME}`,
            })
        }
    }

    /* Check if the message (layers data) is signed by the same address of the Llama user they're trying to update */

    /* Get the existing nftMetadata for this user's address if it exists */

    const nftMetadataArr = await nftMongoose.getAllNftMetadataByProject(LLAMA_PROJECT_NAME)
    const existingNftMetadata = nftMetadataArr.find((metadata) => metadata.address === incomingAddress)

    /* If they already have the NFT */
    if (existingNftMetadata) {
        /* Check if they're trying to change non-modifiable layers: reject */
        for (const requestedLayer of requestedLayers) {
            if (
                nonModifiableCategories.includes(requestedLayer.category) &&
                requestedLayer.name !== existingNftMetadata.layers[requestedLayer.category]
            ) {
                return res.status(400).json({
                    error: `you can't change the ${requestedLayer.category} layer to ${requestedLayer.name} from ${
                        existingNftMetadata.layers[requestedLayer.category]
                    }`,
                })
            }
        }

        if (
            requestedLayers.every((layer) => layer.name === existingNftMetadata.layers[layer.category]) &&
            existingNftMetadata.extra.username === incomingUserData.username &&
            existingNftMetadata.extra.tier === incomingUserData.tier
        ) {
            return res.status(400).json({
                error: 'Nothing has changed. All the layers, your username, and the tier are the same. There is nothing to update',
            })
        }
    }

    /* If they don't already have the NFT */
    if (!existingNftMetadata) {
        /*
        find the metadata that is using all of the same layers for nonModifiable categories.
        (if it's null, then they're allowed to use the layers)
        */
        const matchingMetadata = nftMetadataArr.find((metadata) => {
            // filter attributes to only nonModifiable categories
            const nonModifiableLayers = getEntries(metadata.layers).filter(([key]) =>
                nonModifiableCategories.includes(key),
            )

            // check if all nonModifiable categories are the same
            return nonModifiableLayers.every(([key, value]) => {
                const matchingLayer = requestedLayers.find((layer) => layer.category === key)
                return matchingLayer && matchingLayer.name === value
            })
        })

        // if another address is using the nonModifiable layers, reject
        if (matchingMetadata) {
            return res
                .status(400)
                .json({ error: `This configuration already in use by address: ${matchingMetadata.address}` })
        }
    }

    /* check if this user is allowed to use the layers they've requested */
    const getLayerIfEarned = (
        assetData: AssetData,
        layer: { category: string; name: string },
    ): LayerItemData | undefined => {
        return assetData
            .find((asset) => asset.category === layer.category)
            ?.options.find((option) => option.name === layer.name && option.earned !== false)
    }

    for (const layer of requestedLayers) {
        const matchingAsset = getLayerIfEarned(assetData, layer)
        if (!matchingAsset) {
            return res.status(400).json({ error: `you haven't earned this layer (${layer.category}: ${layer.name})` })
        }
    }

    // generate the multi-layer image using canvas
    const canvas = createCanvas(2400, 2400)
    const ctx = canvas.getContext('2d')

    // TODO sort layers by z-index
    for (const layer of requestedLayers) {
        const matchingAsset = getLayerIfEarned(assetData, layer)
        if (matchingAsset) {
            const image = await loadImage(matchingAsset.pngLink)
            ctx.drawImage(image, 0, 0, 2400, 2400)
        }
    }

    // upload the image to IPFS, return hash
    const ipfsUrl = await addToIpfsFromBuffer(canvas.toBuffer('image/png'))

    const metadata: NftMetadata = {
        project: LLAMA_PROJECT_NAME,
        image: ipfsUrl,
        name: `${incomingUserData.username}'s Llama`,
        address: incomingAddress,
        // address: '0x95155452e617a059b6b0c8af433032d554b03929',
        description: `A Llama created by ${incomingUserData.username}. Llamas are only available to Contributors to Llama DAO. Some traits are chosen, some are earned. ${incomingUserData.username} is a ${incomingUserData.tier} within Llama DAO.`,
        layers: requestedLayers.reduce((acc, layer) => {
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
    if (existingNftMetadata) metadata.tokenId = existingNftMetadata.tokenId

    // save the metadata to the Metagame database
    let savedMetadata: NftMetadata
    try {
        savedMetadata = await nftMongoose.createNftMetadata(metadata)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'error saving metadata to database' })
    }

    const checkResponse = await validateLlamaPfpAllowList(incomingAddress, jwt, llamaUserId)

    return res.status(200).json({
        newMetadata: savedMetadata,
        oldMetadata: existingNftMetadata,
        checkResponse,
    })

    // return res.status(200).send({updated: true})
}

export default allowCors(handler)
