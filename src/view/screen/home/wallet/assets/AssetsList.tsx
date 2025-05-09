import {Address} from "@ton/core";
import BigNumber from "bignumber.js";
import React, {FC, useContext, useEffect, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import styled from "styled-components";
import packageJson from "../../../../../../package.json";
import {JettonAsset, NftAsset} from "../../../../../libs/entries/asset";
import {AppStock, DexStocks} from "../../../../../libs/entries/stock";
import {getWalletAssets} from "../../../../../libs/entries/wallet";
import ExtensionPlatform from "../../../../../libs/service/extension";
import {seeIfJettonAsset} from "../../../../../libs/state/assetService";
import {AssetItemView, AssetJettonView} from "../../../../components/Asset";
import {Center, Gap, InlineButtonLink, Text,} from "../../../../components/Components";
import {LinkIcon} from "../../../../components/Icons";
import {WalletStateContext} from "../../../../context";
import {AppRoute} from "../../../../routes";
import {useJettonWalletBalance} from "./api";
import {AssetRoutes} from "./route";
import {useAddJettonMutation, useJettonFullData} from "./import/api";

const Line = styled(Text)`
    padding: 10px 0 5px;
`;

const JettonRowView: FC<{
    asset: JettonAsset;
    stocks?: DexStocks;
    tonPrice?: number;
}> = React.memo(({asset, stocks, tonPrice}) => {
    const navigate = useNavigate();
    const {data} = useJettonWalletBalance(asset);

    const jettonStocks = useMemo(() => {
        const result = [] as AppStock[];
        try {
            if (stocks) {
                const stockD: AppStock | undefined =
                    stocks.dedust[Address.parse(asset.minterAddress).toString()];
                if (stockD) {
                    result.push(stockD);
                }

                const stockS: AppStock | undefined =
                    stocks.ston[Address.parse(asset.minterAddress).toString()];
                if (stockS) {
                    result.push(stockS);
                }
            }
        } catch (e) {
            console.error(e);
        }

        return result;
    }, [stocks, asset]);

    const price = useMemo(() => {
        const [stock] = jettonStocks;
        if (!stock || !tonPrice) return undefined;
        return new BigNumber(stock.price).multipliedBy(tonPrice).toNumber();
    }, [tonPrice, jettonStocks]);

    return (
        <AssetJettonView
            name={asset.state.symbol}
            logoUrl={asset.state.image}
            decimals={
                asset.state.decimals ? parseInt(asset.state.decimals) : undefined
            }
            balance={data}
            price={price}
            stocks={jettonStocks}
            onShow={() =>
                navigate(
                    AppRoute.assets +
                    AssetRoutes.jettons +
                    "/" +
                    encodeURIComponent(asset.minterAddress)
                )
            }
        />
    );
});

const NftRowView: FC<{ asset: NftAsset }> = React.memo(({asset}) => {
    const navigate = useNavigate();
    const name = useMemo(() => {
        if (asset.state?.name) {
            return asset.state?.name!;
        }

        const item = asset.items.find((item) => item.state?.name);
        if (item) {
            return item.state?.name!;
        }

        return "Unknown";
    }, [asset]);

    const logoUrl = useMemo(() => {
        if (asset.state?.image) {
            return asset.state?.image;
        }
        const item = asset.items.find(
            (item) => item.state && "image" in item.state
        );
        if (item) {
            return (
                (item.state && "image" in item.state && item.state.image) || undefined
            );
        }
        return undefined;
    }, [asset]);

    const url = useMemo(() => {
        const collection =
            AppRoute.assets +
            AssetRoutes.nfts +
            "/" +
            encodeURIComponent(asset.collectionAddress);

        if (asset.items.length !== 1) {
            return collection;
        }

        return collection + "/" + encodeURIComponent(asset.items[0].address);
    }, [asset]);

    return (
        <AssetItemView name={name} logoUrl={logoUrl} onShow={() => navigate(url)}/>
    );
});

export const AssetsList: FC<{
    balance?: string;
    price?: number;
    stocks?: DexStocks;
}> = ({balance, price, stocks}) => {
    const navigate = useNavigate();
    const wallet = useContext(WalletStateContext);

    const [importedJetton, setImportedJetton] = React.useState<JettonAsset | null>(null);

    const assets = useMemo(() => {
        const baseAssets = getWalletAssets(wallet);
        if (importedJetton) {
            const alreadyIncluded = baseAssets.some(a =>
                seeIfJettonAsset(a) &&
                (a as JettonAsset).minterAddress === importedJetton.minterAddress
            );
            return alreadyIncluded ? baseAssets : [...baseAssets, importedJetton];
        }
        return baseAssets;
    }, [wallet, importedJetton]);

    const {
        mutateAsync: jettonFullDataAsync,
        isLoading,
        error,
        reset
    } = useJettonFullData();

    const {
        mutateAsync: addJettonAsync,
        isLoading: isAddLoading,
        reset: resetAdd,
        error: errorAdd,
    } = useAddJettonMutation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const minter = 'EQACbwI38RnvclU5Wv6H9zDr8Ao_tq9NWilXxBmoE8yroZlF';

                const { data, wallet: jettonWallet, name: jettonState } = await jettonFullDataAsync(minter);

                if (jettonState) {
                    setImportedJetton({
                        minterAddress: minter,
                        walletAddress: jettonWallet?.address?.toString() ?? '',
                        state: jettonState,
                    });

                    await addJettonAsync({
                        minter,
                        jettonState,
                        jettonWallet,
                    });
                }
            } catch (error) {
                console.error("Failed to load Jetton data", error);
            }
        };
        fetchData().then(() => {});
    }, []);

    const dontRender = false;

    return (
        <>
            <AssetJettonView
                name="ION"
                logo={<img src="ion-logo.svg" alt="ION" width={40} height={40}/>}
                balance={balance}
                price={price}
            />
            {assets.map((asset) =>
                seeIfJettonAsset(asset) ? (
                    <JettonRowView asset={asset} stocks={stocks} tonPrice={price}/>
                ) : (
                    <NftRowView asset={asset}/>
                )
            )}
            <Gap/>
            <Center>
                <Line>
                    Don't see your tokens?{" "}
                    <InlineButtonLink
                        onClick={() => navigate(AppRoute.assets + AssetRoutes.nfts)}
                    >
                        Import Token
                    </InlineButtonLink>
                </Line>
                <Gap/>
                <br />
                {dontRender && (
                    <Text>
                        Need help?{" "}
                        <InlineButtonLink
                            onClick={() => {
                                ExtensionPlatform.openTab({
                                    url: `${packageJson.repository}/issues`,
                                });
                            }}
                        >
                            Contact us! <LinkIcon/>
                        </InlineButtonLink>
                    </Text>
                )}
            </Center>
        </>
    );
};
