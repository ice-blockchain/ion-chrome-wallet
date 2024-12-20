export {};

interface ITonProvider {
  isOpenMask?: boolean;
  isTonWallet?: boolean;

  nextJsonRpcId;
  callbacks: Record<string, any>;
  promises: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: any) => void;
    }
  >;
  nextJsonRpcId: number;
  _destroy: () => void;
  destroyOpenMask: () => void;
}

declare global {
  interface Window {
    ion: ITonProvider;
    ionmask: {
      provider: ITonProvider;
      ionconnect: TonConnectBridge;
    };
    ionProtocolVersion: number;
  }
}
