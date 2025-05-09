const ifpsProtocol = "ipfs://";

export const ipfsProxy = (url: string) => {
    if (url === "https://raw.githubusercontent.com/catchain/metadata/refs/heads/main/ion/staking/logo.png") {
        url = "https://raw.githubusercontent.com/ice-blockchain/wallets-list/refs/heads/master/lion-square-rounded.svg";
    }
    if (url.startsWith(ifpsProtocol)) {
        return url.replace(ifpsProtocol, "https://ipfs.io/ipfs/");
    }
    return url;
};
