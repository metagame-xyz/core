import Urlbox from 'urlbox'

import { URL_BOX_API_SECRET, URLBOX_API_KEY } from './constants'

export async function activateUrlbox(tokenId: string, height: number, width: number): Promise<string> {
    const urlbox = Urlbox(URLBOX_API_KEY, URL_BOX_API_SECRET)

    const envStr = process.env.VERCEL_ENV === 'production' ? '' : '-dev'

    const baseOptions = {
        url: `https://logbook${envStr}.themetagame.xyz/toScreenshot/${tokenId}`,
        unique: Math.random(),
        format: 'png',
        quality: 100,
        width,
        height,
        // retina: true,
        // gpu: true,
        // wait_for: `.${doneDivClass}`,
        // fail_if_selector_missing: true,
    }

    // force and wait for the image to load
    // const optionsWithForce = {
    //     ...baseOptions,
    //     force: true,
    // }
    // const forceImgUrl = urlbox.buildUrl(optionsWithForce);

    const imgUrl = urlbox.buildUrl(baseOptions)
    await fetch(imgUrl)

    return imgUrl
}
