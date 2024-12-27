import { FC, PropsWithChildren } from "react";
import styled from "styled-components";
import { ButtonPositive, Text } from "../components/Components";
import { LoadingLogo } from "../components/Logo";

const AppHeader = styled.header`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  text-align: center;
  padding: 0 ${(props) => props.theme.padding};
`;

export const Loading = () => {
  return (
    <AppHeader>
        <img src="ion-logo.svg" alt="ION" width={117} height={117}/>
        <Text>Loading</Text>
    </AppHeader>
  );
};

export const NotificationView: FC<
  PropsWithChildren<{
    button: string;
    action: () => void;
  }>
> = ({ children, button, action }) => {
  return (
    <AppHeader>
        <img src="ion-logo.svg" alt="ION" width={117} height={117}/>
        {children}
        <ButtonPositive onClick={action}>{button}</ButtonPositive>
    </AppHeader>
  );
};
