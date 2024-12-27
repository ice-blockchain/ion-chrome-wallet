import {useState} from "react";
import styled from "styled-components";
import ExtensionPlatform from "../../../libs/service/extension";
import {ButtonColumn, ButtonNegative, ButtonPositive, Container, H1,} from "../../components/Components";
import {InputField} from "../../components/InputField";
import {AppRoute} from "../../routes";
import {ConnectRoutes} from "../import/ConnectWallet";
import {useCreatePasswordMutation} from "./api";

const Body = styled(Container)`
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const Initialize = () => {
    return (
        <Body>
            <img src="ion-logo.svg" alt="ION" width={117} height={117}/>
            <H1>Welcome to ION Wallet</H1>
            <ButtonColumn>
                <ButtonPositive
                    onClick={() =>
                        ExtensionPlatform.openExtensionInBrowser(
                            AppRoute.import + ConnectRoutes.create
                        )
                    }
                >
                    Create Wallet
                </ButtonPositive>
                <ButtonNegative
                    onClick={() =>
                        ExtensionPlatform.openExtensionInBrowser(
                            AppRoute.import + ConnectRoutes.import
                        )
                    }
                >
                    Import Wallet
                </ButtonNegative>
            </ButtonColumn>
        </Body>
    );
};

export const CreatePassword = () => {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const {mutateAsync, reset, isLoading, error} = useCreatePasswordMutation();

    const onCreate = async () => {
        reset();
        await mutateAsync([password, confirm]);
    };

    return (
        <Body>
            <img src="ion-logo.svg" alt="ION" width={117} height={117}/>
            <H1>Create Password</H1>
            <ButtonColumn>
                <div>
                    <InputField
                        label="New password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div>
                    <InputField
                        label="Confirm password"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        error={error}
                    />
                </div>

                <ButtonPositive onClick={onCreate} disabled={isLoading}>
                    Create
                </ButtonPositive>
            </ButtonColumn>
        </Body>
    );
};
