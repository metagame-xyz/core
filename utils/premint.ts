import { ethers, Wallet } from 'ethers'

import { NETWORK, VALIDATOR_PRIVATE_KEY } from 'utils/constants'

export type CheckResponse = {
    valid: boolean
    signature: ethers.Signature | null
    data?: any
}

export const createDomainSeparator = (name: string, contractAddress: string, tokenId = '1'): string => {
    // tokenId is use for 1155s, where each tokenId has different mint requirements.
    // for 712s, tokenId is always 1.

    const DOMAIN_SEPARATOR = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'uint256', 'address'],
            [
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name)),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tokenId)),
                NETWORK === 'mainnet' ? 1 : 420, // TODO make this dynamic
                contractAddress,
            ],
        ),
    )

    return DOMAIN_SEPARATOR
}

export const generateSignature = async (address: string, domainSeparator: string) => {
    const signer = new Wallet(VALIDATOR_PRIVATE_KEY, null)

    const payloadHash = ethers.utils.defaultAbiCoder.encode(['bytes32', 'address'], [domainSeparator, address])
    const messageHash = ethers.utils.keccak256(payloadHash)

    const signedAddress = await signer.signMessage(ethers.utils.arrayify(messageHash))
    const signature: ethers.Signature = ethers.utils.splitSignature(signedAddress)
    return signature
}
