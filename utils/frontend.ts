import { createHmac } from 'crypto'

export function debug(varObj: Record<string, any>): void {
    Object.keys(varObj).forEach((str) => {
        console.log(`${str}:`, varObj[str])
    })
}

const gatewayURL = 'https://ipfs.infura.io/ipfs/'
const ipfsScheme = 'ipfs://'
export const ipfsUrlToCIDString = (url: string): string => {
    return url.replace(ipfsScheme, '')
}

export const clickableIPFSLink = (ipfsURL: string): string => {
    return ipfsURL.replace(ipfsScheme, gatewayURL)
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const signMessage = (body, token) => {
    const hmac = createHmac('sha256', token) // Create a HMAC SHA256 hash using the auth token
    hmac.update(JSON.stringify(body), 'utf8') // Update the token hash with the request body using utf8
    const digest = hmac.digest('hex')
    return digest
}

export async function fetcher(url: string, options) {
    let retry = 3
    while (retry > 0) {
        const response: Response = await fetch(url, options)
        if (response.ok) {
            return response.json() as Promise<any>
        } else {
            retry--
            if (retry === 0) {
                throw new Error(`Failed to fetch ${url}`)
            }
            await sleep(2000)
        }
    }
}
