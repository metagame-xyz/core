import { LayerItemRow } from 'types'

import { getS3LayersFolderUrl } from 'utils/constants'

export const llamaS3BucketName = 'llama-pfp'
// https://llama-pfp.s3.us-east-1.amazonaws.com/Layers/Background/Blue_-_Pink_-_Orange.png

const pngFolderUrl = getS3LayersFolderUrl(llamaS3BucketName)

const getPngUrl = (category: string, name: string): string =>
    `${pngFolderUrl}${category}/${name.replaceAll(' ', '_')}.png`

export const allRows: LayerItemRow[] = [
    {
        project: 'llamaPfp',
        category: 'Background',
        modifiable: true,
        name: 'Purple - Blue - Green',
        pngLink: getPngUrl('Background', 'Purple - Blue - Green'),
        earnedCriteria: 'Traveler',
        earnedDescription: 'Reach Traveler Tier',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        modifiable: true,
        name: 'Green - Blue',
        pngLink: getPngUrl('Background', 'Green - Blue'),
        earnedCriteria: 'Explorer',
        earnedDescription: 'Reach Explorer Tier',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        modifiable: true,
        name: 'Green',
        pngLink: getPngUrl('Background', 'Green'),
        earnedCriteria: 'Explorer',
        earnedDescription: 'Reach Explorer Tier',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        modifiable: true,
        name: 'Pink',
        pngLink: getPngUrl('Background', 'Pink'),
        earnedCriteria: 'Mountaineer',
        earnedDescription: 'Reach Mountaineer Tier',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        modifiable: true,
        name: 'Blue - Pink - Orange',
        pngLink: getPngUrl('Background', 'Blue - Pink - Orange'),
        earnedCriteria: 'Mountaineer',
        earnedDescription: 'Reach Mountaineer Tier',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        modifiable: true,
        name: 'Shooting Stars',
        pngLink: getPngUrl('Background', 'Shooting Stars'),
        earnedCriteria: 'Rancher',
        earnedDescription: 'Reach Rancher Tier',
    },
    {
        project: 'llamaPfp',
        category: 'Background',
        modifiable: true,
        name: 'Sparkly',
        pngLink: getPngUrl('Background', 'Sparkly'),
        earnedCriteria: 'Rancher',
        earnedDescription: 'Reach Rancher Tier',
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Black',
        pngLink: getPngUrl('Body', 'Black'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Brown',
        pngLink: getPngUrl('Body', 'Brown'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Brown with Mane',
        pngLink: getPngUrl('Body', 'Brown with Mane'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Cream with Mane',
        pngLink: getPngUrl('Body', 'Cream with Mane'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Brown with Spots',
        pngLink: getPngUrl('Body', 'Brown with Spots'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Cream with Spots',
        pngLink: getPngUrl('Body', 'Cream with Spots'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Unkempt',
        pngLink: getPngUrl('Body', 'Unkempt'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Body',
        modifiable: false,
        name: 'Cream',
        pngLink: getPngUrl('Body', 'Cream'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        modifiable: false,
        name: 'Squinty',
        pngLink: getPngUrl('Eyes', 'Squinty'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        modifiable: false,
        name: 'Slanted Down',
        pngLink: getPngUrl('Eyes', 'Slanted Down'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        modifiable: false,
        name: 'Slanted Up',
        pngLink: getPngUrl('Eyes', 'Slanted Up'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        modifiable: false,
        name: 'Closed Down',
        pngLink: getPngUrl('Eyes', 'Closed Down'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        modifiable: false,
        name: 'Closed Up',
        pngLink: getPngUrl('Eyes', 'Closed Up'),
        earnedCriteria: null,
        earnedDescription: null,
    },
    {
        project: 'llamaPfp',
        category: 'Eyes',
        modifiable: false,
        name: 'Open',
        pngLink: getPngUrl('Eyes', 'Open'),
        earnedCriteria: null,
        earnedDescription: null,
    },
]
