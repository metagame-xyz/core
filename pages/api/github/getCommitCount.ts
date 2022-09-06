import type { NextApiRequest, NextApiResponse } from 'next'

import { gql } from '@apollo/client'

import GithubConnection from './githubConnection'

export default async function handler(req: any, res: NextApiResponse) {
    const { githubUsername, githubAccessToken } = req.user
    const repo = req.query.repo

    const githubConnection = new GithubConnection(githubAccessToken)
    githubConnection.connect()

    const response = await githubConnection.client.query({
        query: gql`
            query {
                user(login: "${githubUsername}") {
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
        (contribution) => contribution?.repository?.name === repo,
    )
    if (!contributions || !contributions.length) return res.status(200).json(0)
    const contributionCount = (contributions[0]?.contributions?.nodes || []).reduce(
        (prev, cur) => prev + (cur?.commitCount || 0),
        0,
    )

    return res.status(200).json(contributionCount)
}
