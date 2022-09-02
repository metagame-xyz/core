import type { NextApiRequest, NextApiResponse } from 'next'

import { gql } from '@apollo/client'

import client from '../snapshotClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const address = req.query.address as string
    const proposal = req.query.proposal as string
    const space = req.query.space as string

    let extraFilters = ``

    if (proposal) extraFilters += `proposal: "${proposal}"`

    const votingPower = await client.query({
        query: gql`query {
      vp (
        voter: "${address}"
        space: "${space}"
        ${extraFilters}
      ) {
        vp
        vp_by_strategy
        vp_state
      } 
    }
    `,
    })
    res.status(200).json(votingPower)
}
