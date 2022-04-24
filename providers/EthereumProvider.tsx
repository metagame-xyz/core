import { ToastPositionWithLogical, useToast, UseToastOptions } from '@chakra-ui/react';
import {
    BaseProvider,
    getDefaultProvider,
    JsonRpcSigner,
    Provider,
    Web3Provider,
} from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Signer } from 'ethers';
import { createContext, useContext, useEffect, useState } from 'react';
import Web3Modal, { getProviderInfo } from 'web3modal';

import {
    ALCHEMY_PROJECT_ID,
    connect_button_clicked,
    INFURA_PROJECT_ID,
    NETWORK,
    networkStrings,
    wallet_provider_clicked,
    wallet_provider_connected,
} from '@utils/constants';
import { debug, event, EventParams, getTruncatedAddress } from '@utils/frontend';

import rainbowLogo from '../images/rainbow.png';

export const wrongNetworkToast: UseToastOptions = {
    title: 'Wrong Network.',
    description: `You must be on ${networkStrings.ethers} to mint`,
    status: 'warning',
    position: 'top',
    duration: 4000,
    isClosable: true,
};

const defaultProvider = getDefaultProvider(networkStrings.ethers, {
    infura: INFURA_PROJECT_ID,
    alchemy: ALCHEMY_PROJECT_ID,
});

const EthereumContext = createContext(undefined);

const providerOptions = {
    'custom-rainbow': {
        display: {
            logo: rainbowLogo.src,
            name: 'Rainbow',
            description: 'Connect using rainbow',
        },
        package: WalletConnectProvider,
        options: {
            infuraId: INFURA_PROJECT_ID, // required
        },
        connector: async (ProviderPackage, options) => {
            const provider = new ProviderPackage(options);
            event('Rainbow Connector Selected', { network: options.network });

            await provider.enable();

            return provider;
        },
    },
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: INFURA_PROJECT_ID, // required
        },
    },
};

const brand50 = 'rgb(250, 245, 255)';
const brand100 = 'rgb(233, 216, 253)';
const brand800 = 'rgb(68, 51, 122)';
const brand800Opaque = 'rgba(68, 51, 122,0.5)';
const brand900 = ' rgb(50, 38, 89)';

function EthereumProvider(props): JSX.Element {
    const [initialized, setInitialized] = useState(false);
    const [provider, setProvider] = useState<BaseProvider>();
    const [signer, setSigner] = useState<Signer>();
    const [userAddress, setUserAddress] = useState<string>();
    const [ensName, setEnsName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [eventParams, setEventParams] = useState<EventParams>({});
    const [web3Modal, setWeb3Modal] = useState<Web3Modal>();

    function setInitialProvider() {
        setProvider(defaultProvider);
    }
    const toast = useToast();

    async function updateVariables(providerFromModal, eventParams) {
        let provider: BaseProvider = defaultProvider;
        let signer: JsonRpcSigner = null;
        let userAddress: string = null;
        let ensName: string = null;
        let userName: string = null;
        let avatarUrl: string = null;

        try {
            const ethersProvider = new Web3Provider(providerFromModal);
            const network = await ethersProvider.getNetwork();
            eventParams.network = network.name;

            // check if network is correct for the given env (prod vs dev)
            if (network.name !== networkStrings.ethers) {
                toast(wrongNetworkToast);
                event('Wrong Network', eventParams);
                throw new Error('Wrong Network');
            }

            const accounts = await ethersProvider.listAccounts();

            // check if there is an account
            if (accounts.length) {
                provider = ethersProvider;
                signer = ethersProvider.getSigner();
                userAddress = await signer.getAddress();
                ensName = await ethersProvider.lookupAddress(userAddress);
                if (ensName) {
                    const ensResolver = await ethersProvider.getResolver(ensName);
                    avatarUrl = await ensResolver.getText('avatar');
                }

                userName = ensName || getTruncatedAddress(userAddress);
            }
        } catch (error) {
            console.log('UPDATE PROVIDER VARIABLES ERROR');
            console.log(error);

            // update variables either with the new provider or the default provider
        } finally {
            setProvider(provider);
            setSigner(signer);
            setUserAddress(userAddress);
            setEnsName(ensName);
            setUserName(userName);
            setAvatarUrl(avatarUrl);
            eventParams = { ...eventParams, hasEns: !!ensName, hasEnsAvatar: !!avatarUrl };
            setEventParams(eventParams);
            event(wallet_provider_connected, eventParams);
        }
    }

    async function connect(provider, eventParams: EventParams, web3Modal: Web3Modal) {
        try {
            const { id: connectionType, name: connectionName } = getProviderInfo(provider);
            eventParams = { ...eventParams, connectionType, connectionName };
            event(wallet_provider_clicked, eventParams);

            await updateVariables(provider, eventParams);
            // Subscribe to accounts change
            provider.on('accountsChanged', async (accounts: string[]) => {
                if (!accounts.length) {
                    web3Modal.clearCachedProvider();
                }
                console.log('accountsChanged');
                await updateVariables(provider, eventParams);
            });

            // Subscribe to chainId change
            provider.on('chainChanged', async (chainId: number) => {
                debug({ chainId });
                await updateVariables(provider, eventParams);
                // window.location.reload();
            });

            // Subscribe to provider connection
            provider.on('connect', (info: { chainId: number }) => {
                console.log('provider fromModal Connected');
                debug({ info });
            });

            // Subscribe to provider disconnection
            provider.on('disconnect', (error: { code: number; message: string }) => {
                console.log('provider fromModal disconnected');

                debug({ error });
                updateVariables(provider, eventParams);
            });
        } catch (error) {
            event('Web3Modal closed by user', {
                network: NETWORK,
                buttonLocation: eventParams.buttonLocation,
            });
            // error seems to be undefined when the user rejects connecting to metamask
            console.log('WEB3 MODAL ERROR:', error);
        }
    }

    async function openWeb3ModalGenerator(buttonLocation) {
        let eventParams: EventParams = { buttonLocation, network: NETWORK };
        event(connect_button_clicked, eventParams);

        const providerFromModal = await web3Modal.connect();

        await connect(providerFromModal, eventParams, web3Modal);
    }

    useEffect(() => {
        setInitialProvider();
        setInitialized(true);

        const web3Modal = new Web3Modal({
            network: networkStrings.web3Modal, // optional
            cacheProvider: true,
            providerOptions, // required
            theme: {
                background: brand900,
                main: brand50,
                secondary: brand100,
                border: brand800Opaque,
                hover: brand800,
            },
        });

        setWeb3Modal(web3Modal);

        async function reconnectIfAvailable() {
            if (web3Modal.cachedProvider) {
                let eventParams: EventParams = { buttonLocation: 'reconnection', network: NETWORK };
                const provider = await web3Modal.connect();
                await connect(provider, eventParams, web3Modal);
            }
        }
        reconnectIfAvailable();
    }, []);

    const openWeb3Modal = async (buttonLocation: string) =>
        await openWeb3ModalGenerator(buttonLocation);

    const variables = {
        provider,
        signer,
        userAddress,
        ensName,
        userName,
        avatarUrl,
        eventParams,
        web3Modal,
    };
    const functions = { openWeb3Modal, toast };

    const value = { ...variables, ...functions };

    return initialized ? <EthereumContext.Provider value={value} {...props} /> : null;
}

export const useEthereum = () => {
    return useContext(EthereumContext);
};

export default EthereumProvider;
