import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'

import { DB_REQUEST_TOKEN, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, METABOT_BASE_API_URL } from 'utils/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const code = req.query.code as string
    const address = req.query.address as string
    try {
        let { data: accessToken } = await axios.post(
            `http://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`,
        )

        const regex = /gho_\w+/

        const regexResult = regex.exec(accessToken)

        if (regexResult && regexResult.length) {
            accessToken = regexResult[0]
        } else {
            res.status(500).json({ error: 'Malformed access token' })
            return
        }

        console.log('TOKEN', accessToken)

        const { data: user } = await axios.get('https://api.github.com/user', {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `token ${accessToken}`,
            },
        })

        if (!user) {
            res.status(500).json({ error: 'Could not find user' })
            return
        }

        const username = user.login

        const { data: response } = await axios.post(
            `${METABOT_BASE_API_URL}db/setGithubCredentials`,
            {
                username,
                accessToken,
                address,
            },
            {
                headers: {
                    'x-db-request-token': DB_REQUEST_TOKEN,
                },
            },
        )
        if (response.success) {
            res.status(200).json({ success: true })
        } else {
            res.status(500).json({ error: response.error })
        }
    } catch (err) {
        console.log('github err', err)
        res.status(500).json({ error: 'BAD' })
    }
}
