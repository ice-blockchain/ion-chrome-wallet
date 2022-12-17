import {
  TonConnectItemReply,
  TonConnectRequest,
} from "../../entries/notificationMessage";
import { revokeAllDAppAccess } from "../../state/connectionSerivce";
import {
  getConnections,
  getNetwork,
  setConnections,
} from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
import { waitApprove } from "./utils";

export const tonConnectRequest = async (
  id: number,
  origin: string,
  data: TonConnectRequest
) => {
  memoryStore.addNotification({
    kind: "tonConnectRequest",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data,
  });

  try {
    const popupId = await openNotificationPopUp();
    const result = await waitApprove<TonConnectItemReply[]>(id, popupId);

    return result;
  } finally {
    memoryStore.removeNotification(id);
  }
};

export const tonConnectDisconnect = async (id: number, origin: string) => {
  const network = await getNetwork();
  const connections = await getConnections(network);
  await setConnections(revokeAllDAppAccess(connections, origin), network);
};
