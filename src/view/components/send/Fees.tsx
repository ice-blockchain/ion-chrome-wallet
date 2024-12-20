import { fromNano } from "@openproduct/web-sdk";
import { FC } from "react";
import { EstimateFeeValues } from "../../../libs/entries/tonCenter";
import { fiatFees } from "../../utils";
import { TextLine } from "../Components";
import { Dots } from "../Dots";

export const Fees: FC<{ estimation?: EstimateFeeValues }> = ({
  estimation,
}) => {
  if (!estimation) {
    return (
      <>
        <TextLine>Network fee estimation:</TextLine>
        <TextLine>
          <Dots>Loading</Dots>
        </TextLine>
      </>
    );
  }
  const totalTon = fromNano(
    String(
      estimation.fwd_fee +
        estimation.in_fwd_fee +
        estimation.storage_fee +
        estimation.gas_fee
    )
  );

  return (
    <>
      <TextLine>Network fee estimation:</TextLine>
      <TextLine>
        ~<b>{fiatFees.format(parseFloat(totalTon))} ICE</b>
      </TextLine>
    </>
  );
};
