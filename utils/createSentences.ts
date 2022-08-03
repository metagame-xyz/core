import collect, { Collection } from 'collect.js'
import { Action, getEntries, getKeys, getValues, Interpretation } from 'evm-translator'

type FilteredData = {
    actions: Action[]
    txHash: string
    localLink: string
    link: string
    contractName: string
    contractAddress: string
    exampleDescription: string
    toName: string
    fromName: string
    assetSentType: string | undefined
    assetReceivedType: string | undefined
}

export default function createSentences(interpretedData: (Interpretation | null)[]): Record<string, any> {
    const filteredData = interpretedData
        .filter((data) => data !== null)
        .map(
            ({
                txHash,
                actions,
                contractName,
                contractAddress,
                exampleDescription,
                toName,
                fromName,
                assetsReceived,
                assetsSent,
            }) => {
                return {
                    actions,
                    txHash,
                    localLink: `http://localhost:3000/api/tx/${txHash}`,
                    link: `https://etherscan.io/tx/${txHash}`,
                    contractName,
                    contractAddress,
                    exampleDescription,
                    toName,
                    fromName,
                    assetSentType: assetsSent[0]?.type,
                    assetReceivedType: assetsReceived[0]?.type,
                } as FilteredData
            },
        )

    const grouped = collect(filteredData).groupBy('actions')

    const data = grouped.all() as unknown as Record<Action, Collection<any>>
    const actions = getKeys(data)

    const names = filteredData.filter(({ fromName, toName }) => (fromName || toName) && 'OPENSEA' !== toName)
    // .map(({ fromName, toName }) => fromName || toName)

    const knownAddresses = {
        OpenSea: ['0x7f268357a8c2552623316e2562d90e642bb538e5', '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b'],
        Uniswap: [
            '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
            '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
            '0xe592427a0aece92de3edee1f18e0157c05861564',
        ],
        Gem: [
            `0x0000000035634b55f3d99b071b5a354f48e10bef`,
            '0xf24629fbb477e10f2cf331c2b7452d8596b5c7a5',
            '0x0000000031f7382a812c64b604da4fc520afef4b',
        ], // TODO these aren't actually "gem" sales, they used gem to buy the NFTs off opensea, we need a different way of tracking what platform you listed it on. The easiest way is prob checking for a fee going to the listing platform
        SushiSwap: ['0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f'],
        ['0x']: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
        ['Mirror Write Race']: ['0x6da5f047b1ec9e822f132efdf02e76eddf29dbf5'],
        'Party Of The Living Dead': ['0x2912f57f93dd69fbbf477b616d6f8c34c49bb282'],
        Juicebox: ['0xd569d3cce55b71a8a3f3c418c329a66e5f714431'],
        LooksRare: ['0xa35dce3e0e6ceb67a30b8d7f4aee721c949b5970'],
        // specific nfts
        Sheilds: ['0x0747118c9f44c7a23365b2476dcd05e03114c747'],
        Zorbs: ['0xca21d4228cdcc68d4e23807e5e370c07577dd152'],
        'PartyBid Punk#2066': ['0x1003fcba76b07bb978b79a71d11e957dcdd54ebd'],
        'Poolsuite - Executive Member': ['0xb228d7b6e099618ca71bd5522b3a8c3788a8f172'],
    }

    const specialNfts = {
        Shields: '0x0747118c9f44c7a23365b2476dcd05e03114c747',
        Loot: '0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7',
        Blitmap: '0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63',
        CryptoCoven: '0x5180db8f5c931aae63c74266b211f580155ecac8',
        MannysGame: '0x2bd58a19c7e4abf17638c5ee6fa96ee5eb53aed9',
        DeveloperDAO: '0x25ed58c027921e14d86380ea2646e3a1b5c55a8b',
        ChainRunners: '0x97597002980134bea46250aa0510c9b90d87a587',
        Zora: '0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7',
        Zorbs: '0xca21d4228cdcc68d4e23807e5e370c07577dd152',
        TubbyCats: '0xca7ca7bcc765f77339be2d648ba53ce9c8a262bd',
        BoysClub: '0x8158bdd0286e5b2384f2cf4eba94e741295d437e',
        CompanionInABox: '0x13bd2ac3779cbbcb2ac874c33f1145dd71ce41ee',
        AnimalColoringBook: '0x69c40e500b84660cb2ab09cb9614fa2387f95f64',
        gallery: '0xe3d0fe9b7e0b951663267a3ed1e6577f6f79757e',
        poolSuite: '0xb228d7b6e099618ca71bd5522b3a8c3788a8f172',
        parallel: '0x76be3b62873462d2142405439777e971754e8e77',
    }

    const knownAddressArr = getValues(knownAddresses).flat()

    // MINT

    const mints = data.minted?.all() as unknown as FilteredData[]
    // const mints = data.minted?.groupBy('contractAddress').all() as unknown as Record<
    //     string,
    //     Collection<FilteredData>
    // >
    const mintSentences = []
    console.log('mints', mints)

    let nftMintNames = []
    if (mints && mints.length > 0) {
        const specialMints = mints.filter((tx) => getValues(specialNfts).includes(tx?.contractAddress))
        const normalMints = mints.filter((tx) => !getValues(specialNfts).includes(tx?.contractAddress))

        const specialMintsGrouped = collect(specialMints).groupBy('contractName').all() as unknown as Record<
            string,
            Collection<FilteredData>
        >
        const normalMintsGrouped = collect(normalMints).groupBy('contractAddress').all() as unknown as Record<
            string,
            Collection<FilteredData>
        >

        for (const [nftName, txs] of getEntries(specialMintsGrouped)) {
            // debugger
            const count = txs.count()

            const sentence = `minted ${count} ${nftName}`
            mintSentences.push(sentence)
        }

        const erc721Mints = getValues(normalMintsGrouped).filter((tx) => tx.all()[0]?.assetReceivedType === 'ERC721')
        const erc20Mints = getValues(normalMintsGrouped).filter((tx) => tx.all()[0]?.assetReceivedType === 'ERC20')

        nftMintNames = erc721Mints.map((tx) => [tx.all()[0]?.contractName, tx.all()[0]?.contractAddress])

        const plural = erc721Mints.length > 1 ? 's' : ''
        const plural2 = erc20Mints.length > 1 ? 's' : ''
        const diff = erc20Mints.length > 1 ? 'different ' : ''

        const mintCollectionSentence = `minted ${erc721Mints.length} NFT collection${plural}`
        const mintTokensSentence = `minted ${erc20Mints.length} ${diff}token${plural2}`

        if (erc721Mints.length > 0) mintSentences.push(mintCollectionSentence)
        if (erc20Mints.length > 0) mintSentences.push(mintTokensSentence)
    }

    // BOUGHT
    const bought = data.bought?.all() as unknown as FilteredData[]
    const boughtSentences = []
    if (bought?.length > 0) {
        for (const [exchange, addresses] of getEntries(knownAddresses)) {
            const txs = bought.filter((tx) => addresses.includes(tx.contractAddress))
            const tokenType = txs[0]?.assetReceivedType === 'ERC20' ? 'token' : 'NFT'
            const count = txs.length
            const plural = count > 1 ? 's' : ''

            if (count > 0) {
                boughtSentences.push(`bought ${count} ${tokenType}${plural} on ${exchange}`)
            }
        }
    }

    // SOLD
    const sold = data.sold?.all() as unknown as FilteredData[]
    const soldSentences = []
    if (sold?.length > 0) {
        for (const [exchange, addresses] of getEntries(knownAddresses)) {
            const txs = sold.filter((tx) => addresses.includes(tx.contractAddress)).filter((tx) => !!tx.assetSentType)
            const tokenType = txs[0]?.assetSentType === 'ERC20' ? 'token' : 'NFT'
            const count = txs.length
            const plural = count > 1 ? 's' : ''

            if (count > 0) {
                soldSentences.push(`sold ${count} ${tokenType}${plural} on ${exchange}`)
            }
        }
    }

    // CLAIMED
    const claimed = data.claimed?.all() as unknown as FilteredData[]
    const claimedSentences = []
    console.log('claimed', claimed)
    if (claimed?.length > 0) {
        for (const [exchange, addresses] of getEntries(knownAddresses)) {
            const txs = claimed.filter((tx) => addresses.includes(tx.contractAddress))
            // console.log('txs', txs)
            const tokenType = txs[0]?.assetReceivedType === 'ERC20' ? 'token' : 'NFT'
            const count = txs.length
            const plural = count > 1 ? 's' : ''

            if (count > 0) {
                claimedSentences.push(`claimed ${tokenType}s from ${exchange}`)
            }
        }
    }

    // GOT AIRDROPPED
    const airdrops = collect(data['got airdropped']).groupBy('contractAddress').all() as unknown as Record<
        string,
        Collection<any>
    >
    const airdropSentences = []

    if (airdrops && getKeys(airdrops).length > 0) {
        const erc721Airdrops = getValues(airdrops).filter((tx) => tx.all()[0]?.assetReceivedType === 'ERC721')
        const erc20Airdrops = getValues(airdrops).filter((tx) => tx.all()[0]?.assetReceivedType === 'ERC20')

        const airdropCollectionSentence = `got airdropped ${erc721Airdrops.length} different NFT collections`
        const airdropTokensSentence = `got airdropped ${erc20Airdrops.length} different tokens`

        if (erc721Airdrops.length > 0) airdropSentences.push(airdropCollectionSentence)
        if (erc20Airdrops.length > 0) airdropSentences.push(airdropTokensSentence)
    }

    //DEPLOYED

    const deployedSentences = []

    const deployed = data.deployed?.all() as unknown as FilteredData[]
    if (deployed?.length > 0) {
        const plural = deployed.length > 1 ? 's' : ''
        deployedSentences.push(`deployed ${deployed.length} contract${plural}`)
    }

    // CONTRIBUTED
    const contributed = data.contributed?.all() as unknown as FilteredData[]
    const contributedSentences = []
    if (contributed?.length > 0) {
        for (const [exchange, addresses] of getEntries(knownAddresses)) {
            const txs = contributed.filter((tx) => addresses.includes(tx.contractAddress))
            const count = txs.length
            const plural = count > 1 ? 's' : ''

            if (count > 0) {
                contributedSentences.push(`contributed to ${count} project${plural} on ${exchange}`)
            }
        }
    }

    // swapped
    const swapped = data.swapped?.all() as unknown as FilteredData[]
    const swappedSentences = []
    if (swapped?.length > 0) {
        for (const [exchange, addresses] of getEntries(knownAddresses)) {
            const txs = swapped.filter((tx) => addresses.includes(tx.contractAddress))
            const tokenType =
                txs[0]?.assetReceivedType === 'ERC20' || txs[0]?.assetSentType === 'ERC20' ? 'token' : 'NFT'
            const count = txs.length
            const plural = count > 1 ? 's' : ''

            if (count > 0) {
                swappedSentences.push(`swapped ${count} ${tokenType}${plural} on ${exchange}`)
            }
        }
    }

    // TODO

    const unknownTxs = data.______TODO______?.all() as FilteredData[]

    const unknownSentences = []
    if (unknownTxs?.length > 0) {
        unknownSentences.push(`and ${unknownTxs.length} other transactions waiting to be interpreted`)
    }

    // BURNED
    const burned = data.burned?.groupBy('assetSentType').all() as unknown as Record<string, Collection<FilteredData>>
    const burnedSentences = []
    if (burned && getKeys(burned).length > 0) {
        for (const [assetType, txs] of getEntries(burned)) {
            const count = txs.all().length
            const asset = assetType === 'ERC20' ? 'token' : 'NFT'
            const plural = count > 1 ? 's' : ''

            if (count > 0) {
                burnedSentences.push(`burned ${count} ${asset}${plural}`)
            }
        }
    }

    // REVERTED
    const reverted = data.unknown?.all() || ([] as FilteredData[])
    const revertedSentences = []
    if (reverted.length > 0) {
        const plural = reverted.length > 1 ? 's' : ''
        revertedSentences.push(`had ${reverted.length} transaction${plural} reverted`)
    }

    // SENT
    // sent ETH
    // funded a gnosis safe TODO

    const sent = data.sent?.groupBy('assetSentType').all() as unknown as Record<string, Collection<FilteredData>>
    const sentSentences = []

    if (sent && getKeys(sent).length > 0) {
        for (const [assetType, txs] of getEntries(sent)) {
            const count = getKeys(txs.groupBy('contractAddress').all()).length

            let asset = ''
            let prefixIfNotPlural = ''
            switch (assetType) {
                case 'native':
                    asset = 'ETH'
                    break
                case 'ERC20':
                    asset = 'tokens'
                    break
                case 'ERC721':
                case 'ERC1155':
                    asset = 'NFT'
                    prefixIfNotPlural = 'an '
                    break
                default:
                    break
            }
            const plural = count > 1 && assetType !== 'native' && assetType !== 'ERC20' ? 's' : ''
            prefixIfNotPlural = plural ? '' : prefixIfNotPlural
            const plural2 = count > 1 ? 'es' : ''

            if (count > 0 && asset) {
                sentSentences.push(`sent ${prefixIfNotPlural}${asset}${plural} to ${count} address${plural2}`)
            }
        }
    }

    // RECEIVED
    const specialReceived = data.received.all().filter((tx) => tx.fromName)
    const genericReceived = data.received.all().filter((tx) => !tx.fromName)
    const receivedSentences = []

    if (specialReceived.length > 0) {
        const specialGroupedByFrom = collect(specialReceived).groupBy('fromName').all() as unknown as Record<
            string,
            Collection<FilteredData>
        >

        for (const [fromName, txs] of getEntries(specialGroupedByFrom)) {
            const groupedByAsset = txs.groupBy('assetReceivedType').all() as unknown as Record<
                string,
                Collection<FilteredData>
            >

            for (const [assetType, txs] of getEntries(groupedByAsset)) {
                const count = txs.all().length
                let asset = ''
                let prefixIfNotPlural = ''
                switch (assetType) {
                    case 'native':
                        asset = 'ETH'
                        break
                    case 'ERC20':
                        asset = 'tokens'
                        break
                    case 'ERC721':
                    case 'ERC1155':
                        asset = 'NFT'
                        prefixIfNotPlural = 'an '
                        break
                    default:
                        break
                }

                const plural = count > 1 && assetType !== 'native' && assetType !== 'ERC20' ? 's' : ''
                prefixIfNotPlural = plural ? '' : prefixIfNotPlural
                const plural2 = count > 1 ? 's' : ''

                if (count > 0 && asset) {
                    receivedSentences.push(
                        `received ${prefixIfNotPlural}${asset}${plural} from ${fromName} ${count} time${plural2}`,
                    )
                }
            }
        }
    }

    if (genericReceived.length > 0) {
        const genericGroupedByAssetType = collect(genericReceived)
            .groupBy('assetReceivedType')
            .all() as unknown as Record<string, Collection<FilteredData>>

        for (const [assetType, txs] of getEntries(genericGroupedByAssetType)) {
            const count = getKeys(txs.groupBy('contractAddress').all()).length

            let asset = ''
            let prefixIfNotPlural = ''
            switch (assetType) {
                case 'native':
                    asset = 'ETH'
                    break
                case 'ERC20':
                    asset = 'tokens'
                    break
                case 'ERC721':
                    asset = 'NFT'
                    prefixIfNotPlural = 'an '
                    break
                case 'ERC1155':
                    asset = '1155'
                    prefixIfNotPlural = 'an '
                    break
                default:
                    break
            }

            const plural = count > 1 && assetType !== 'native' && assetType !== 'ERC20' ? 's' : ''
            prefixIfNotPlural = plural ? '' : prefixIfNotPlural
            const plural2 = count > 1 ? 'es' : ''

            if (count > 0 && asset) {
                sentSentences.push(`received ${prefixIfNotPlural}${asset}${plural} from ${count} address${plural2}`)
            }
        }
    }

    // executed

    const executed = data.executed?.all() || ([] as FilteredData[])
    const executedSentences = []

    if (executed.length > 0) {
        const plural = executed.length > 1 ? 's' : ''
        executedSentences.push(`executed ${executed.length} Gnosis Safe transaction${plural}`)
    }
    //revoked

    const revoked = data.revoked?.all() || ([] as FilteredData[])
    const revokedSentences = []

    if (revoked.length > 0) {
        const plural = revoked.length > 1 ? 's' : ''
        revokedSentences.push(`revoked access for tokens or NFTs ${revoked.length} time${plural}`)
    }

    // created a Gnosis safe
    const createdGnosis = data['created a Gnosis safe']?.all() || ([] as FilteredData[])
    const createdGnosisSentences = []

    if (createdGnosis.length > 0) {
        const plural = createdGnosis.length > 1 ? 's' : ''
        createdGnosisSentences.push(`created ${createdGnosis.length} Gnosis safe${plural}`)
    }

    // cancelled a bid maybe

    const cancelledBid = data['cancelled a bid']?.all() || ([] as FilteredData[])
    const cancelledBidSentences = []

    if (cancelledBid.length > 0) {
        const plural = cancelledBid.length > 1 ? 's' : ''
        cancelledBidSentences.push(`cancelled ${cancelledBid.length} bid${plural}`)
    }

    // transferred
    const transferred = data['transferred']?.all() || ([] as FilteredData[])
    const transferredSentences = []

    if (transferred.length > 0) {
        const plural = transferred.length > 1 ? 'es' : ''
        transferredSentences.push(`received ${transferred.length} ENS${plural}`)
    }
    // registered
    const registered = data['registered']?.all() || ([] as FilteredData[])
    const registeredSentences = []

    if (registered.length > 0) {
        const plural = registered.length > 1 ? 's' : ''
        registeredSentences.push(`registered ${registered.length} ENS${plural}`)
    }

    // set a default ENS name
    const setENSName = data['set a default ENS name']?.all() || ([] as FilteredData[])
    const setENSNameSentences = []

    if (setENSName.length > 0) {
        const plural = setENSName.length > 1 ? 's' : ''
        setENSNameSentences.push(`set a default ENS name ${setENSName.length} time${plural}`)
    }

    // renewed
    const renewed = data['renewed']?.all() || ([] as FilteredData[])
    const renewedSentences = []

    if (renewed.length > 0) {
        const plural = renewed.length > 1 ? 's' : ''
        renewedSentences.push(`renewed an ENS${plural} ${renewed.length} time${plural}`)
    }

    // bridged (need contract-specific first)

    const uniqueSentences = []

    const hackTxHashes = [
        '0xc010aa0eda23ccd89a6bedf967652c1d8dfed9cc9d2ee02e9744e36a0392e409',
        '0xad59348372bbb710a3e03eb0e9861af71b436c4cb1d0fc6bc7d0de53dd0d8c78',
    ]
    // issued fwb after the hack: https://etherscan.io/tx/0xc010aa0eda23ccd89a6bedf967652c1d8dfed9cc9d2ee02e9744e36a0392e409
    const postHackTx = filteredData.find((tx) => hackTxHashes.includes(tx.txHash))
    if (postHackTx) {
        uniqueSentences.push(`was re-issued $FWB after the March '21 hack`)
    }

    // paid by fwb: https://etherscan.io/tx/0xc840415316bc7ba172362117d4015babc9f9e0626746fca181f2b3f7c3b12c0d
    const fwbAddresses = ['0x660f6d6c9bcd08b86b50e8e53b537f2b40f243bd', '0x33e626727b9ecf64e09f600a1e0f5adde266a0df']
    const paidByFwb = filteredData.find(
        (tx) => fwbAddresses.includes(tx.contractAddress) && !hackTxHashes.includes(tx.txHash),
    )
    if (paidByFwb) {
        uniqueSentences.push(`was paid by FWB for being a contributor`)
    }

    // const unknownTxs = []
    // for (const action of actions) {
    //     const txs = action.filter((tx) => !knownAddressArr.includes(tx.contractAddress))
    //     if (txs.length > 0) console.log('otherBought', txs)
    //     unknownTxs.push(...txs)
    // }

    const sentences = [
        ...uniqueSentences,
        ...deployedSentences,
        ...contributedSentences,
        ...createdGnosisSentences,
        ...executedSentences,
        ...mintSentences,
        ...receivedSentences,
        ...claimedSentences,
        ...sentSentences,
        ...boughtSentences,
        ...soldSentences,
        ...swappedSentences,
        ...burnedSentences,
        ...revokedSentences,
        ...cancelledBidSentences,
        ...registeredSentences,
        ...setENSNameSentences,
        ...renewedSentences,
        ...airdropSentences,
        ...revertedSentences,
        ...transferredSentences,

        ...unknownSentences,
    ]

    // const sortedSentences = sentences.sort((a: string[], b: string[]) => a.length - b.length)

    // const maxLength = sortedSentences[sortedSentences.length - 1].length
    // const filledOutSentences = sortedSentences.map((sentence) => {
    //     const len = sentence.length
    //     const missing = maxLength - len
    //     const fillerStr = ' '.repeat(missing)
    //     const arr = sentence.split(' ')
    //     arr.splice(2, 0, fillerStr)
    //     return arr.join(' ')
    // })

    return {
        paidByFwb,
        actions,
        sentences,
        nftMintNames,
        unknownTxs,
        reverted,
    }
}
