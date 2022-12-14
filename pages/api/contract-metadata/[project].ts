import type { NextApiRequest, NextApiResponse } from 'next'

import { THE_METAGAME_ETH_ADDRESS, WEBSITE_URL } from 'utils/constants'
import { copy } from 'utils/content'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const project = req.query.project as string

    let metadata = null

    // seller_fee_basis_points: 800 // 8%

    if (project === 'llamaPfp') {
        metadata = {
            name: `Llama Avatars`,
            description: ``,
            // image: `https://${WEBSITE_URL}/logo.png`,
            // external_link: `https://${WEBSITE_URL}`,
            seller_fee_basis_points: 0,
            fee_recipient: '0Xa519A7Ce7B24333055781133B13532Aeabfac81B', // llamacommunity.eth
        }
    }

    // TODO project data for each project. This will show up on the opensea page. Can probably hard code for now but will need to be migrated to DB with a UI to let communities update it themselves.
    // const metadata = {
    //     name: `${project} NFT`,
    //     description: ``,
    //     image: `https://${WEBSITE_URL}/logo.png`,
    //     external_link: `https://${WEBSITE_URL}`,
    //     seller_fee_basis_points: 800, // 8%,
    //     fee_recipient: THE_METAGAME_ETH_ADDRESS,
    // }

    res.send(metadata)
}
