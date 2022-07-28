import { NextApiRequest, NextApiResponse } from 'next'
import { label, Middleware } from 'next-api-middleware'

import { isValidEventForwarderSignature } from 'utils'

import { isProdEnv } from './constants'

const localOnly: Middleware = async (req: NextApiRequest, res: NextApiResponse, next) => {
    try {
        if (isProdEnv) throw new Error('Local API calls are disabled in production.')

        await next()
    } catch (e) {
        console.error(e)
        res.status(500).json({ statusCode: 500, message: e.message })
    }
}

const eventForwarderAuth: Middleware = async (req: NextApiRequest, res: NextApiResponse, next) => {
    try {
        if (!isValidEventForwarderSignature(req)) throw new Error('invalid event-forwarder Signature')
        await next()
    } catch (e) {
        console.error(e)
        res.status(500).json({ statusCode: 500, message: e.message })
    }
}

const withMiddleware = label(
    {
        localOnly,
        eventForwarderAuth,
    },
    [], //defaults, just add the string
)

export default withMiddleware
