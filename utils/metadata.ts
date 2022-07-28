import { WEBSITE_URL } from 'utils/constants'

export type Metadata = {
    name: string
    description: string
    image: string
    externalUrl: string
    address: string
}

export function formatNewMetadata(minterAddress: string, userName: string, tokenId: string): Metadata {
    const metadata: Metadata = {
        name: `${userName}'s thing`,
        description: 'desc',
        image: `https://${WEBSITE_URL}/placeholder.png`,
        externalUrl: `https://${WEBSITE_URL}/view/${tokenId}`,
        address: minterAddress,
    }

    return metadata
}

export function formatMetadataWithOldMetadata(oldMetadata: Metadata, userName: string): Metadata {
    const metadata: Metadata = {
        ...oldMetadata,
    }

    return metadata
}

type Attributes = {
    display_type?: string
    trait_type: string
    value: any
}

export type OpenSeaMetadata = {
    name: string
    description: string
    image: string
    external_url: string
    attributes: Attributes[]
}

const camelCaseToSnakeCase = (str: string) => str.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
const snakeCaseToHumanReadable = (str: string) => str.replace(/_/g, ' ')
const camelCaseToHumanReadable = (str: string) => snakeCaseToHumanReadable(camelCaseToSnakeCase(str))
const ccTohr = (str: string) => camelCaseToHumanReadable(str)
const titleCaseEveryWord = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

export function metadataToOpenSeaMetadata(metadata: Metadata): OpenSeaMetadata {
    const openseaMetadata: OpenSeaMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        external_url: metadata.externalUrl,
        attributes: [
            {
                trait_type: 'address',
                value: metadata.address,
            },
        ],
    }

    return openseaMetadata
}
