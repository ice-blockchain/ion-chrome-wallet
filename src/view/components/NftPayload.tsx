import React, {FC} from "react";
import styled from "styled-components";
import {NftItemState} from "../../libs/entries/asset";
import {ipfsProxy} from "../../libs/service/requestService";
import {Text} from "./Components";

declare global {
    interface Window {
        ionNFTCollection?: (config: {
            elementIdentifier: string;
            HTTP_API_JSON_RPC_URI: string;
            items: string[];
        }) => void;
    }
}

const Block = styled.div`
    padding: 0 0 ${(props) => props.theme.padding} 0;
`;

const ImageWrapper = styled.div`
    padding: ${(props) => props.theme.padding};
    margin-bottom: ${(props) => props.theme.padding};
    border: 1px solid ${(props) => props.theme.darkGray};
    border-radius: 20px;
    text-align: center;
`;

const NftImage = styled.img`
    max-height: 200px;
    max-width: 100%;
`;

const Domain = styled.span`
    font-size: large;
    font-weight: bold;
    display: inline-block;
    margin: ${(props) => props.theme.padding} 0;
`;

export const NftPayload: FC<{ state?: NftItemState | null, itemAddress?: string | null }> = React.memo(
    ({state, itemAddress}) => {
        if (!state) {
            return (
                <Block>
                    <Text>Missing NFT content</Text>
                </Block>
            );
        }

        console.log(`NFT Item stats ${JSON.stringify(state)}`);

        const interval = setInterval(() => {
            if (window.ionNFTCollection && itemAddress) {
                window.ionNFTCollection({
                    elementIdentifier: 'nft-item',
                    HTTP_API_JSON_RPC_URI: 'https://api.mainnet.ice.io/http/v2/jsonRPC',
                    items: [
                        itemAddress ? itemAddress : ''
                    ]
                })
                clearInterval(interval)
            }
        }, 100);

        if ("domain" in state) {
            return (
                <Block>
                    {state.name && (
                        <Text>
                            <b>{state.name}</b>
                        </Text>
                    )}
                    <ImageWrapper>
                        <Domain>
                            {state.domain}.{state.root}
                        </Domain>
                    </ImageWrapper>
                </Block>
            );
        }

        return (
            <Block>
                {state.name && (
                    <Text>
                        <b>{state.name}</b>
                    </Text>
                )}
                {/*
                <ImageWrapper>
                    <NftImage src={ipfsProxy(state.image)} alt="NFT image"/>
                </ImageWrapper>
                */}
                {state.description && <Text>{state.description}</Text>}
                <div id="nft-item" className="ion-nft-collection"></div>
            </Block>
        );
    }
);
