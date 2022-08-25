import type { NextApiRequest, NextApiResponse } from 'next'

import { gql } from '@apollo/client'

import GithubConnection from '../githubConnection'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const address = req.query.address as string
    const repoName = req.query.repo as string

    const githubConnection = new GithubConnection(address)
    await githubConnection.connect()
    const { client, username } = githubConnection

    const response = await client.query({
        query: gql`
            query {
                user(login: "${username}") {
                    name
                    contributionsCollection {
                        commitContributionsByRepository {
                            contributions(last: 100) {
                                nodes {
                                    commitCount
                                }
                            }
                            repository {
                                name
                            }
                        }
                    }
                }
            }
        `,
    })
    const contributions = (response?.data?.user?.contributionsCollection?.commitContributionsByRepository || []).filter(
        (contribution) => contribution?.repository?.name === repoName,
    )
    if (!contributions || !contributions.length) res.status(200).json(0)
    const contributionCount = (contributions[0]?.contributions?.nodes || []).reduce(
        (prev, cur) => prev + (cur?.commitCount || 0),
        0,
    )

    res.status(200).json(contributionCount)
}
