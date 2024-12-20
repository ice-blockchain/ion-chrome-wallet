import { TonProvider } from "./libs/provider";
import { TonConnect } from "./libs/provider/tonconnect";

const havePrevInstance = !!window.ion;

const provider = new TonProvider(window?.ion);
const ionconnect = new TonConnect(provider, window?.ionmask?.ionconnect);

window.ionProtocolVersion = 2;
window.ion = provider;
window.ionmask = {
  provider,
  ionconnect,
};

if (!havePrevInstance) {
  window.dispatchEvent(new Event("ionready"));
}
