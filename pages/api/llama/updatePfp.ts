import type { NextApiRequest, NextApiResponse } from 'next'

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
    const exampleBody: { jwt: string; layers: RequestedPfpLayers } = {
        jwt: 'abc123',
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
    const { jwt, layers } = req.body

    // use JWT to get Address, ENS, etc from llama backend

    if (jwt === 'check against llama backend') {
        const error = 'invalid Llama user or jwt'
        // logger.error({ error }); TODO
        return res.status(400).send({ error })
    }

    // check if this user is allowed to use the layers they've requested

    // return res.status(200).send({updated: true})
}
