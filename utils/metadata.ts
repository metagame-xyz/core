import { ioredisClient } from 'utils';
import { ProductionNetworks, WEBSITE_URL } from 'utils/constants';

import { getBeatsPerMinute } from './frontend';
import { debug } from './logging';
import { getAllTransactions } from './requests';

/****************/
/* GET TXN DATA */
/****************/
export async function getTxnData(minterAddress: string, tokenId = null): Promise<TxnCounts> {
    const address = minterAddress.toLowerCase();

    const txnCounts: TxnCounts = {};

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();

    const networks: ProductionNetworks[] = ['ethereum', 'polygon', 'fantom'];

    for (const network of networks) {
        let transactions = [];
        try {
            transactions = await getAllTransactions(address, network, tokenId);
        } catch (error) {
            error.third_party_name = network;
            throw error;
        }

        let txnsInLastDay = 0;
        let txnsInLastWeek = 0;
        let txnsInLastMonth = 0;
        const txnTotalCount = transactions.length;

        transactions.every((txn) => {
            const timestamp = txn.timeStamp * 1000;
            if (timestamp > oneDayAgo) {
                txnsInLastDay++;
            }

            if (timestamp > oneWeekAgo) {
                txnsInLastWeek++;
            }

            if (timestamp > oneMonthAgo) {
                txnsInLastMonth++;
            } else {
                return false;
            }
            return true;
        });

        txnCounts[network] = {
            totalTransactions: txnTotalCount,
            transactionsYesterday: txnsInLastDay,
            transactionsLastWeek: txnsInLastWeek,
            transactionsLastMonth: txnsInLastMonth,
        };
    }

    txnCounts.avalanche = {
        totalTransactions: 0,
        transactionsYesterday: 0,
        transactionsLastWeek: 0,
        transactionsLastMonth: 0,
    };

    return txnCounts;
}

export type TxnCounts = {
    ethereum?: SingleNetworkTxnCounts;
    polygon?: SingleNetworkTxnCounts;
    fantom?: SingleNetworkTxnCounts;
    avalanche?: SingleNetworkTxnCounts;
};

export type SingleNetworkTxnCounts = {
    totalTransactions: number;
    transactionsYesterday: number;
    transactionsLastWeek: number;
    transactionsLastMonth: number;
};

export type Metadata = {
    name: string;
    description: string;
    image: string;
    externalUrl: string;
    address: string;
};

export function formatNewMetadata(
    minterAddress: string,
    userName: string,
    tokenId: string,
): Metadata {
    const metadata: Metadata = {
        name: `${userName}'s thing`,
        description: 'desc',
        image: `https://${WEBSITE_URL}/placeholder.png`,
        externalUrl: `https://${WEBSITE_URL}/view/${tokenId}`,
        address: minterAddress,
    };

    return metadata;
}

export function formatMetadataWithOldMetadata(oldMetadata: Metadata, userName: string): Metadata {
    const metadata: Metadata = {
        ...oldMetadata,
    };

    return metadata;
}

type Attributes = {
    display_type?: string;
    trait_type: string;
    value: any;
};

export type OpenSeaMetadata = {
    name: string;
    description: string;
    image: string;
    external_url: string;
    attributes: Attributes[];
};

const camelCaseToSnakeCase = (str: string) =>
    str.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
const snakeCaseToHumanReadable = (str: string) => str.replace(/_/g, ' ');
const camelCaseToHumanReadable = (str: string) =>
    snakeCaseToHumanReadable(camelCaseToSnakeCase(str));
const ccTohr = (str: string) => camelCaseToHumanReadable(str);
const titleCaseEveryWord = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

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
    };

    return openseaMetadata;
}

export async function getMetadata(tokenIdOrAddress: string): Promise<Metadata> {
    const metadata = await ioredisClient.hget(tokenIdOrAddress.toLowerCase(), 'metadata');

    if (!metadata) {
        throw new Error(`tokenId Or Address ${tokenIdOrAddress} not found`);
    }

    return JSON.parse(metadata);
}

export async function getTokenIdForAddress(address: string): Promise<string> {
    const tokenId = await ioredisClient.hget(address.toLowerCase(), 'tokenId');

    if (!tokenId) {
        throw new Error(`tokenId for address ${address} not found`);
    }

    return tokenId.toString();
}

export async function getAddressForTokenId(tokenId: string): Promise<string> {
    const address = await ioredisClient.hget(tokenId.toLowerCase(), 'address');

    if (!address) {
        throw new Error(`address for tokenId ${tokenId} not found`);
    }

    return address.toString();
}

export async function updateMetadata(metadata: Metadata, tokenId: string, address = null) {
    if (!address) {
        address = await getAddressForTokenId(tokenId);
    }

    await ioredisClient.hset(tokenId.toLowerCase(), 'metadata', JSON.stringify(metadata));
    await ioredisClient.hset(address.toLowerCase(), 'metadata', JSON.stringify(metadata));
}
