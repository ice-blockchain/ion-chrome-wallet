import { Cell } from "@ton/core";
import { FC, useContext, useMemo, useState } from "react";
import styled from "styled-components";
import {
  TonConnectTransactionPayload,
  TonConnectTransactionPayloadMessage,
} from "../../../../libs/entries/notificationMessage";
import { NotificationFields } from "../../../../libs/event";
import { delay } from "../../../../libs/state/accountService";
import { FingerprintLabel } from "../../../FingerprintLabel";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Text,
  TextLine,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { Dots } from "../../../components/Dots";
import { CheckIcon, SpinnerIcon, TimeIcon } from "../../../components/Icons";
import { Fees } from "../../../components/send/Fees";
import { WalletStateContext } from "../../../context";
import { askBackground, sendBackground } from "../../../event";
import { formatTonValue, toShortAddress } from "../../../utils";
import {
  useEstimateTransactions,
  useLastBocMutation,
  useSendLedgerMutation,
  useSendMnemonicMutation,
} from "./api";

interface PayloadMessage extends TonConnectTransactionPayloadMessage {
  isSend?: boolean;
  isConfirmed?: boolean;
}

const Row = styled.div`
  display: flex;
  gap: ${(props) => props.theme.padding};
  margin: 5px ${(props) => props.theme.padding};
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  align-items: center;
`;

const Column = styled.div`
  margin: 5px ${(props) => props.theme.padding};
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
`;

const Icon = styled.span`
  font-size: 200%;
`;

const Blue = styled.span`
  color: ${(props) => props.theme.blueTon};
`;

const TransactionItem: FC<{ message: PayloadMessage }> = ({ message }) => {
  const name = useMemo(() => {
    if (!message.payload) return;
    try {
      const cell = Cell.fromBase64(message.payload);
      const operation = cell.asSlice().loadUint(32);
      switch (operation) {
        case 0x5fcc3d14:
          return "NFT Transfer";
        case 0xf8a7ea5:
          return "Jetton Transfer";
        default:
          return undefined;
      }
    } catch (e) {
      return undefined;
    }
  }, [message]);

  return (
    <Row>
      <Icon>
        {message.isConfirmed ? (
          <Blue>
            <CheckIcon />
          </Blue>
        ) : message.isSend ? (
          <Blue>
            <SpinnerIcon />
          </Blue>
        ) : (
          <TimeIcon />
        )}
      </Icon>

      <div>
        <TextLine>{name ?? "SENDING"}:</TextLine>
        <TextLine>
          <b>{formatTonValue(String(message.amount))} ICE</b> to{" "}
          {toShortAddress(message.address || "", 6)}
        </TextLine>
      </div>
    </Row>
  );
};

const timeout = 60 * 1000; // 60 sec

const SendLedgerTransactions: FC<{
  data: TonConnectTransactionPayload;
  onCancel: () => void;
  onOk: (payload: string) => void;
}> = ({ data, onCancel, onOk }) => {
  const [isSending, setSending] = useState(false);
  const [isConfirm, setConfirm] = useState(data.messages.length == 1);

  const [items, setItems] = useState<PayloadMessage[]>(data.messages);
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: getLastBoc } = useLastBocMutation();
  const { data: estimation } = useEstimateTransactions(data);
  const { mutateAsync: sendAsync, reset } = useSendLedgerMutation();

  const onConfirm = async () => {
    setSending(true);
    try {
      for (let i = 0; i < items.length; i++) {
        let state = items[i];
        if (state.isConfirmed) {
          continue;
        }
        reset();

        setItems((s) =>
          s.map((item) =>
            item === state ? (state = { ...state, isSend: true }) : item
          )
        );

        const seqno = await sendAsync(state);

        if (i !== items.length - 1) {
          await askBackground<void>(timeout).message("confirmSeqNo", seqno);
        }

        setItems((s) =>
          s.map((item) =>
            item === state ? (state = { ...state, isConfirmed: true }) : item
          )
        );
      }

      const payload = await getLastBoc().catch(() => "");
      onOk(payload);
    } catch (e) {
      setError(e as Error);
      setSending(false);
      setItems((s) =>
        s.map((item) => (item.isConfirmed ? item : { ...item, isSend: false }))
      );
    }
  };

  if (!isConfirm) {
    return (
      <>
        <Column>
          <Text>
            The Ton Ledger App version 2.0 does not support sending multiple
            transfers per transaction.
          </Text>
          <Text>You may sign and send multiple transfers one by one.</Text>
          <Text>
            Please do not interrupt the execution of transactions to get
            multiple transfer expected result.
          </Text>
        </Column>
        <Gap />
        <ButtonRow>
          <ButtonNegative onClick={onCancel}>Cancel</ButtonNegative>
          <ButtonPositive onClick={() => setConfirm(true)}>
            Agree
          </ButtonPositive>
        </ButtonRow>
      </>
    );
  }

  const disabledCancel = isSending;
  const disabledConfirm = isSending;

  return (
    <>
      {items.map((message, index) => (
        <TransactionItem key={index} message={message} />
      ))}
      {estimation && (
        <Row>
          <Fees estimation={estimation} />
        </Row>
      )}

      <Gap />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}

      <ButtonRow>
        <ButtonNegative onClick={onCancel} disabled={disabledCancel}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onConfirm} disabled={disabledConfirm}>
          {isSending ? (
            <Dots>Sending</Dots>
          ) : (
            <FingerprintLabel>Continue</FingerprintLabel>
          )}
        </ButtonPositive>
      </ButtonRow>
    </>
  );
};

const SendMnemonicTransactions: FC<{
  data: TonConnectTransactionPayload;
  origin: string;
  onCancel: () => void;
  onOk: (payload: string) => void;
}> = ({ data, origin, onCancel, onOk }) => {
  const [isSending, setSending] = useState(false);

  const [items, setItems] = useState<PayloadMessage[]>(data.messages);
  const [error, setError] = useState<Error | null>(null);

  const { data: estimation } = useEstimateTransactions(data);

  const {
    mutateAsync,
    reset,
    error: sendError,
  } = useSendMnemonicMutation(origin);

  const onConfirm = async () => {
    setSending(true);
    try {
      reset();
      setItems((s) => s.map((item) => ({ ...item, isSend: true })));

      const message = await mutateAsync(data);

      setItems((s) => s.map((item) => ({ ...item, isConfirmed: true })));

      onOk(message);
    } catch (e) {
      setError(e as Error);
      setSending(false);
    }
  };

  const disabledCancel = isSending;
  const disabledConfirm = isSending || error != null;

  return (
    <>
      {items.map((message, index) => (
        <TransactionItem key={index} message={message} />
      ))}
      {estimation && (
        <Row>
          <Fees estimation={estimation} />
        </Row>
      )}

      {sendError && <ErrorMessage>{sendError.message}</ErrorMessage>}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}

      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={onCancel} disabled={disabledCancel}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onConfirm} disabled={disabledConfirm}>
          {isSending ? (
            <Dots>Sending</Dots>
          ) : (
            <FingerprintLabel>Confirm</FingerprintLabel>
          )}
        </ButtonPositive>
      </ButtonRow>
    </>
  );
};

export const ConnectSendTransaction: FC<
  NotificationFields<"tonConnectSend", TonConnectTransactionPayload> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, onClose, data }) => {
  const wallet = useContext(WalletStateContext);

  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onOk = async (payload: string) => {
    sendBackground.message("approveRequest", { id, payload });
    await delay(500);
    onClose();
  };

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>
          {data.messages.length > 1
            ? `Send ${data.messages.length} Transactions`
            : "Send Transaction"}
        </H1>
        <Text>Would you like to send transaction?</Text>
      </Center>
      {wallet.ledger ? (
        <SendLedgerTransactions data={data} onCancel={onCancel} onOk={onOk} />
      ) : (
        <SendMnemonicTransactions
          data={data}
          origin={origin}
          onCancel={onCancel}
          onOk={onOk}
        />
      )}
    </Body>
  );
};
