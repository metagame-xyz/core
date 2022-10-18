import type { NextApiRequest, NextApiResponse } from 'next'

import { gql } from '@apollo/client'

import client from '../snapshotClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const address = req.query.address as string
    const proposal = req.query.proposal as string
    const space = req.query.space as string

    let extraFilters = ``

    if (proposal) extraFilters += `proposal: "${proposal}",`
    if (space) extraFilters += `space: "${space}",`

    const votes = await client.query({
        query: gql`query Votes {
      votes (
        first: 1000
        skip: 0
        where: {
          voter: "${address}",
          ${extraFilters}
        }
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        voter
        created
        proposal {
          id
        }
        choice
        space {
          id
        }
      }
    }
    `,
    })
    res.status(200).json(votes)
}
