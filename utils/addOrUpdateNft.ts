import { getUserName, ioredisClient } from '@utils';
import {
    formatMetadataWithOldMetadata,
    formatNewMetadata,
    getTxnData,
    Metadata,
    TxnCounts,
} from '@utils/metadata';

import { LogData, logError, logSuccess } from './logging';

export type newNftResponse = {
    tokenId: string;
    minterAddress: string;
    userName: string;
    ensName: string;
};

export async function addOrUpdateNft(
    minterAddress: string,
    tokenId: string,
    forceCount = false,
): Promise<newNftResponse> {
    const address = minterAddress.toLowerCase();

    const logData: LogData = {
        level: 'info',
        token_id: tokenId,
        function_name: 'addOrUpdateNft',
        message: `begin`,
        wallet_address: address,
    };

    /****************/
    /* GET TXN DATA */
    /****************/
    let txnCounts: TxnCounts;
    let userName: string;
    try {
        logData.third_party_name = 'getTxnData';
        txnCounts = await getTxnData(address, tokenId);

        logData.third_party_name = 'ethers getUserName';
        userName = await getUserName(address);

        logData.third_party_name = 'redis';
        const oldMetadata: Metadata = JSON.parse(await ioredisClient.hget(tokenId, 'metadata'));
        const firstTime = !oldMetadata;

        // await ioredisClient.hset(address, { tokenId, metadata: JSON.stringify(metadata) });
        // await ioredisClient.hset(tokenId, { address: address, metadata: JSON.stringify(metadata) });

        logSuccess(logData);
        return {
            tokenId,
            minterAddress: address,
            userName,
            ensName: userName,
        };
    } catch (error) {
        logError(logData, error);
        throw error;
    }
}
