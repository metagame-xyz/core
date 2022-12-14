import { LayerItemRow } from 'types'

import { getS3LayersFolderUrl } from 'utils/constants'
import { LLAMA_PROJECT_NAME } from 'utils/llama'

const pngFolderUrl = getS3LayersFolderUrl(LLAMA_PROJECT_NAME)
// const pngFolderUrl = getR2LayersFolderUrl(LLAMA_PROJECT_NAME)
// const pngFolderUrl = getTwicPicFolderUrl(LLAMA_PROJECT_NAME)

const getPngUrl = (category: string, name: string): string =>
    `${pngFolderUrl}${category}/${name.replaceAll(' ', '_')}.png`

export const zIndexMap = {
    Background: 0,
    Body: 10,
    Eyes: 20,
    Ears: 30,
}

export const allRows: LayerItemRow[] = [
    {
        project: 'llamaPfp',
        category: 'Background',
        zIndex: 0,
        modifiable: true,
        name: 'Purple - Blue - Green',
        pngLink: getPngUrl('Background', 'Purple - Blue - Green'),
        earnedCriteria: 'Traveler',
        earnedDescription: 'Traveler',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        zIndex: 0,
        modifiable: true,
        name: 'Green - Blue',
        pngLink: getPngUrl('Background', 'Green - Blue'),
        earnedCriteria: 'Explorer',
        earnedDescription: 'Explorer',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        zIndex: 0,
        modifiable: true,
        name: 'Green',
        pngLink: getPngUrl('Background', 'Green'),
        earnedCriteria: 'Explorer',
        earnedDescription: 'Explorer',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        zIndex: 0,
        modifiable: true,
        name: 'Pink',
        pngLink: getPngUrl('Background', 'Pink'),
        earnedCriteria: 'Mountaineer',
        earnedDescription: 'Mountaineer',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        zIndex: 0,
        modifiable: true,
        name: 'Blue - Pink - Orange',
        pngLink: getPngUrl('Background', 'Blue - Pink - Orange'),
        earnedCriteria: 'Mountaineer',
        earnedDescription: 'Mountaineer',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        zIndex: 0,
        modifiable: true,
        name: 'Shooting Stars',
        pngLink: getPngUrl('Background', 'Shooting Stars'),
        earnedCriteria: 'Rancher',
        earnedDescription: 'Rancher',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        zIndex: 0,
        modifiable: true,
        name: 'Sparkly',
        pngLink: getPngUrl('Background', 'Sparkly'),
        earnedCriteria: 'Rancher',
        earnedDescription: 'Rancher',
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Black',
        pngLink: getPngUrl('Body', 'Black'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Brown',
        pngLink: getPngUrl('Body', 'Brown'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Brown with Mane',
        pngLink: getPngUrl('Body', 'Brown with Mane'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Cream with Mane',
        pngLink: getPngUrl('Body', 'Cream with Mane'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Brown with Spots',
        pngLink: getPngUrl('Body', 'Brown with Spots'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Cream with Spots',
        pngLink: getPngUrl('Body', 'Cream with Spots'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Unkempt',
        pngLink: getPngUrl('Body', 'Unkempt'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Cream',
        pngLink: getPngUrl('Body', 'Cream'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Black Wavy',
        pngLink: getPngUrl('Body', 'Black Wavy'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Brown Wavy',
        pngLink: getPngUrl('Body', 'Brown Wavy'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Dark Gray with Mane',
        pngLink: getPngUrl('Body', 'Dark Gray with Mane'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Gray Wavy',
        pngLink: getPngUrl('Body', 'Gray Wavy'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Gray with Spots',
        pngLink: getPngUrl('Body', 'Gray with Spots'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        zIndex: 10,
        modifiable: false,
        name: 'Gray',
        pngLink: getPngUrl('Body', 'Gray'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Squinty',
        pngLink: getPngUrl('Eyes', 'Squinty'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Slanted Down',
        pngLink: getPngUrl('Eyes', 'Slanted Down'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Slanted Up',
        pngLink: getPngUrl('Eyes', 'Slanted Up'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Closed Down',
        pngLink: getPngUrl('Eyes', 'Closed Down'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Closed Up',
        pngLink: getPngUrl('Eyes', 'Closed Up'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Open',
        pngLink: getPngUrl('Eyes', 'Open'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Ears',
        zIndex: 30,
        modifiable: true,
        name: 'Plain',
        pngLink: getPngUrl('Ears', 'Plain'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Caret',
        pngLink: getPngUrl('Eyes', 'Caret'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Glisten',
        pngLink: getPngUrl('Eyes', 'Glisten'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Stoic',
        pngLink: getPngUrl('Eyes', 'Stoic'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Teary',
        pngLink: getPngUrl('Eyes', 'Teary'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        zIndex: 20,
        modifiable: false,
        name: 'Wink',
        pngLink: getPngUrl('Eyes', 'Wink'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Ears',
        zIndex: 30,
        modifiable: true,
        name: 'X',
        pngLink: getPngUrl('Ears', 'X'),
        earnedCriteria: null,
        earnedDescription: null,
    },
]

/* get all none-modifiable categories */
export const nonModifiableCategories = allRows
    .filter((row) => row.modifiable === false)
    .reduce((acc, row) => {
        const uniques = acc.includes(row.category) ? acc : [...acc, row.category]
        return uniques
    }, [])
