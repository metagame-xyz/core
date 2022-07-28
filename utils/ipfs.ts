import { CID, create, urlSource } from 'ipfs-http-client'

import { INFURA_IPFS_PROJECT_ID, INFURA_IPFS_SECRET } from 'utils/constants'

const auth = 'Basic ' + Buffer.from(INFURA_IPFS_PROJECT_ID + ':' + INFURA_IPFS_SECRET).toString('base64')

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
})

const ipfsScheme = 'ipfs://'
export const ipfsUrlToCIDString = (url: string): string => {
    return url.replace(ipfsScheme, '')
}

export const addToIpfsFromUrl = async (url: string): Promise<string> => {
    // TODO: use the mutable folder structure
    const file = await client.add(urlSource(url).content)
    return ipfsScheme + file.path
}

export const addToIpfsFromSvgStr = async (svgStr: string): Promise<string> => {
    const arr = new TextEncoder().encode(svgStr)

    const file = await client.add(arr)
    return ipfsScheme + file.path
}

export const removeFromIPFS = async (ipfsURL: string): Promise<CID> => {
    const cid = ipfsUrlToCIDString(ipfsURL)
    const result = await client.pin.rm(cid)
    return result
}

export const listIPFSPins = async (): Promise<any> => {
    for await (const { cid, type } of client.pin.ls()) {
        console.log(`https://logbook.infura-ipfs.io/${cid.toString()}`)
        // console.log({ cid, type });
    }
}
