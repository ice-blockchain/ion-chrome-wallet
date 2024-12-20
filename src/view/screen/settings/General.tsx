import styled from "styled-components";
import { ProxyHost, PublicTonProxy } from "../../../libs/entries/proxy";
import ExtensionPlatform from "../../../libs/service/extension";
import {
  Body,
  ErrorMessage,
  H1,
  InlineLink,
  SelectLabel,
  SelectPayload,
} from "../../components/Components";
import { DropDownList } from "../../components/DropDown";
import { HomeButton } from "../../components/HomeButton";
import { ArrowDownIcon, LinkIcon } from "../../components/Icons";
import { AppRoute } from "../../routes";
import {
  useDataCollection,
  useLockScreen,
  useProxyConfiguration,
  useSetDataCollection,
  useSetLockScreen,
  useUpdateProxyMutation,
} from "./api";

const Quote = styled.div`
  padding: 5px 0;
`;

const ProxyItems = (PublicTonProxy as (ProxyHost | undefined)[]).concat([
  undefined,
]);

const TONProxyInfoLink =
  "https://telegra.ph/ICE-Sites-ICE-WWW-and-ICE-Proxy-09-29-2";

const ProxySelect = () => {
  const { data: proxy, isFetching } = useProxyConfiguration();
  const { mutate, reset, isLoading, error } = useUpdateProxyMutation();

  const updateProxy = (host: ProxyHost | undefined) => {
    reset();
    mutate(host);
  };

  const disableProxy = isFetching || isLoading;

  return (
    <>
      <SelectLabel>ICE Proxy</SelectLabel>
      <DropDownList
        isLeft
        options={ProxyItems}
        renderOption={(value) =>
          value ? `ICE ${value.host}:${value.port}` : "Disabled"
        }
        onSelect={(value) => updateProxy(value)}
        disabled={disableProxy}
      >
        <SelectPayload disabled={disableProxy}>
          {proxy?.enabled
            ? `ICE ${proxy.domains["ton"].host}:${proxy.domains["ton"].port}`
            : "Disabled"}
          <ArrowDownIcon />
        </SelectPayload>
      </DropDownList>
      <Quote>
        ICE Proxy configuration to enabled ICE WWW and ICE Sites in your browser{" "}
        <InlineLink
          onClick={() => ExtensionPlatform.openTab({ url: TONProxyInfoLink })}
        >
          Read more <LinkIcon />
        </InlineLink>
        <br />
        <br />
        ICE search engine:{" "}
        <InlineLink
          onClick={() =>
            ExtensionPlatform.openTab({ url: "http://searching.ton" })
          }
        >
          http://searching.ton <LinkIcon />
        </InlineLink>
      </Quote>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </>
  );
};

const LockScreenSelect = () => {
  const { data: isLockScreen } = useLockScreen();
  const { mutate } = useSetLockScreen();
  return (
    <>
      <SelectLabel>Lock Screen</SelectLabel>
      <label>
        <input
          type="checkbox"
          checked={isLockScreen}
          onChange={(e) => mutate(e.target.checked)}
        />
        Enable Lock Screen
      </label>
    </>
  );
};

const DataCollectionSelect = () => {
  const { data: isEnabled } = useDataCollection();
  const { mutate } = useSetDataCollection();

  return (
    <>
      <SelectLabel>Analytics</SelectLabel>
      <label>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => mutate(e.target.checked)}
        />
        Enable Data Collection to help OpenMask improve user experience
      </label>
    </>
  );
};

export const GeneralSettings = () => {
  return (
    <>
      <HomeButton path={AppRoute.settings} text="Back to Settings" />
      <Body>
        <H1>General</H1>
        <LockScreenSelect />
        <DataCollectionSelect />
        <ProxySelect />
      </Body>
    </>
  );
};
