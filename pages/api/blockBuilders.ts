import type { NextApiRequest, NextApiResponse } from 'next'

import { computeAddress } from 'ethers/lib/utils'

import { fetcher } from 'utils/requests'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // const address = req.query.address as string
        // const check = req.query.check as string

        type BlockBuilder = {
            slot: string
            parent_hash: string
            block_hash: string
            builder_pubkey: string
            proposer_pubkey: string
            proposer_fee_recipient: string
            gas_limit: string
            gas_used: string
            value: string
        }

        const data = (await fetcher(
            `https://boost-relay.flashbots.net/relay/v1/data/bidtraces/proposer_payload_delivered?limit=200`,
        )) as BlockBuilder[]

        // const builderAddresses = [...new Set(data.map((builder) => builder.proposer_fee_recipient))]
        // const builderPubkeys = [...new Set(data.map((builder) => builder.builder_pubkey))]

        // console.log(builderAddresses.map((builder) => `https://etherscan.io/address/${builder}`))
        // console.log(builderPubkeys.map((builder) => `https://etherscan.io/address/${builder}`))

        // const builderPubkeysHashed = [...new Set(data.map((builder) => computeAddress(builder.builder_pubkey)))]
        // console.log(builderPubkeysHashed.map((builder) => `https://etherscan.io/address/${builder}`))

        // res.status(200).json({ builderPubkeys, builderPubkeysHashed, builderAddresses })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}

// builder_pubkey
//0x81beef03aafd3dd33ffd7deb337407142c80fea2690e5b3190cfc01bde5753f28982a7857c96172a75a234cb7bcb994f

// compressed
//0x0376698beebe8ee5c74d8cc50ab84ac301ee8f10af6f28d0ffd6adf4d6d3b9b762
// uncompressed
//0x0476698beebe8ee5c74d8cc50ab84ac301ee8f10af6f28d0ffd6adf4d6d3b9b762d46ca56d3dad2ce13213a6f42278dabbb53259f2d92681ea6a0b98197a719be3
