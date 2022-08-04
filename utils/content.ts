import { WEBSITE_URL } from 'utils/constants'

export interface MetaProps {
    description?: string
    image?: string
    title: string
    type?: string
}

const description = 'DESCRIPTION'

export const headMetadata: MetaProps = {
    title: 'Logbook by the Metagame',
    description,
    image: `https://${WEBSITE_URL}/site-preview.png`,
    type: 'website',
}

export const copy = {
    title: 'Logbook by the Metagame',
    nameLowercase: 'NAME_LOWERCASE',
    heroSubheading: description,
    heading1: 'HEADING 1',
    text1: 'TEXT 1',
    heading2: 'HEADING 2',
    text2: 'TEXT 2',
    heading3: 'HEADING 3',
    text3: 'TEXT 3',
    bottomSectonHeading: 'bottomSectonHeading',
    bottomSectionText: `bottomSectionText`,
}
