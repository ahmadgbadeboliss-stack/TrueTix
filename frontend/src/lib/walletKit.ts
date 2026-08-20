import { StellarWalletsKit, KitEventType, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { RabetModule } from "@creit.tech/stellar-wallets-kit/modules/rabet";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";

StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new RabetModule(),
    new AlbedoModule(),
    new LobstrModule(),
  ],
});

export { StellarWalletsKit, KitEventType };
