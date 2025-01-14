export interface NetworkConfig {
    isCustom?: boolean;
    isDefault: boolean;
    name: string;
    id: TonConnectNETWORK | string;
    rpcUrl: string;
    apiKey?: string;
    scanUrl: string;
    rootDnsAddress: string;
}

export enum TonConnectNETWORK {
    TESTNET = "-3",
}

// Need to get this address from network Config #4
const testnetRootDnsAddress =
    "Ef_v5x0Thgr6pq6ur2NvkWhIf4DxAxsL-Nk5rknT6n99oPKX";

export const defaultNetworkConfigs: NetworkConfig[] = [
    {
        isDefault: true,
        name: "Testnet", // aka chainId
        id: TonConnectNETWORK.TESTNET,
        rpcUrl: "https://api.testnet.ice.io/http/v2/jsonRPC",
        apiKey: process.env.REACT_APP_TONCENTER_TESTNET_API_KEY,
        scanUrl: "https://explorer.testnet.ice.io/address/",
        rootDnsAddress: testnetRootDnsAddress,
    }, {
        isDefault: true,
        name: "Mainnet", // aka chainId
        id: TonConnectNETWORK.TESTNET,
        rpcUrl: "https://api.mainnet.ice.io/http/v2/jsonRPC",
        apiKey: process.env.REACT_APP_TONCENTER_TESTNET_API_KEY,
        scanUrl: "https://explorer.ice.io/address/",
        rootDnsAddress: testnetRootDnsAddress,
    },
];

export const selectNetworkConfig = (
    network?: string,
    networks?: NetworkConfig[]
) => {
    const list = networks ?? defaultNetworkConfigs;
    const result = list.find((item) => item.name === network);
    return result ?? list[0];
};

export const replaceNetworkConfig = (
    network: NetworkConfig,
    networks: NetworkConfig[]
) => {
    return networks.map((item) => (item.name === network.name ? network : item));
};

export const createCustomNetworkConfig = (
    network: NetworkConfig
): NetworkConfig => {
    return {
        ...network,
        isCustom: true,
        apiKey: "",
    };
};
