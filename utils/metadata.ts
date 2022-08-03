import { NftMetadata } from './models'

type Attributes = {
    display_type?: string
    trait_type: string
    value: string | number | boolean
}

export type OpenSeaMetadata = {
    name: string
    description: string
    image: string
    external_url: string
    attributes: Attributes[]
}

// const camelCaseToSnakeCase = (str: string) => str.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
// const snakeCaseToHumanReadable = (str: string) => str.replace(/_/g, ' ')
// const camelCaseToHumanReadable = (str: string) => snakeCaseToHumanReadable(camelCaseToSnakeCase(str))
// const ccTohr = (str: string) => camelCaseToHumanReadable(str)
// const titleCaseEveryWord = (str: string) =>
//     str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

export function metadataToOpenSeaMetadata(metadata: NftMetadata): OpenSeaMetadata {
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
            {
                trait_type: 'sentence count',
                value: metadata.sentences.length,
            },
        ],
    }

    return openseaMetadata
}
