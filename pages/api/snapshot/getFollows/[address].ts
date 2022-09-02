import type { NextApiRequest, NextApiResponse } from 'next'

import { gql } from '@apollo/client'

import client from '../snapshotClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const address = req.query.address as string
    const space = req.query.space as string

    let extraFilters = ``

    if (space) extraFilters += `space: "${space}",`

    const follows = await client.query({
        query: gql`query {
      follows(
        first: 10,
        where: {
          follower: "${address}",
          ${extraFilters}
        }
      ) {
        follower
        space {
          id
        }
        created
      }
    }
    `,
    })
    res.status(200).json(follows)
}
