import { WEBSITE_URL } from 'utils/constants'

export interface MetaProps {
    description?: string
    image?: string
    title: string
    type?: string
}

export const appName = 'Template'

const description = 'DESCRIPTION change me'

export const headMetadata: MetaProps = {
    title: 'TITLE Change me',
    description,
    image: `https://${WEBSITE_URL}/images/site-preview.png`,
    type: 'website',
}

export const copy = {
    title: 'Template',
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
