import { getEntries } from 'evm-translator'

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

export const metadataToOpenSeaMetadata = (metadata: NftMetadata): OpenSeaMetadata => {
    const extraAsAttributes = getEntries(metadata.extra).map(([key, value]) => ({ trait_type: key, value }))
    const layersAsAttributes = getEntries(metadata.layers).map(([key, value]) => ({ trait_type: key, value }))
    const attributes = [...extraAsAttributes, ...layersAsAttributes]

    const openseaMetadata: OpenSeaMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        external_url: metadata.externalUrl,
        attributes,
    }

    return openseaMetadata
}
