import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { StellarWalletsKit, KitEventType } from "../lib/walletKit";
import { NETWORK_PASSPHRASE } from "../lib/env";
import { posthog } from "../lib/posthog";

interface WalletContextValue {
  address: string | undefined;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<{ signedTxXdr: string; signerAddress?: string }>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      setAddress(event.payload.address);
    });
    return unsubscribe;
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const { address } = await StellarWalletsKit.authModal();
      setAddress(address);
      posthog.capture("wallet_connected", { address });
    } catch (err) {
      // User closed the modal or the wallet rejected the request — not an
      // application error, so nothing to surface beyond staying disconnected.
      console.warn("Wallet connect cancelled or failed", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    setAddress(undefined);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("No wallet connected");
      return StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address,
      });
    },
    [address],
  );

  const value = useMemo(
    () => ({ address, connecting, connect, disconnect, signTransaction }),
    [address, connecting, connect, disconnect, signTransaction],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
