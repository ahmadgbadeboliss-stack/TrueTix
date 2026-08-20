import { Asset, BASE_FEE, Horizon, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { HORIZON_URL, NETWORK_PASSPHRASE, TUSDC_ASSET_CODE, TUSDC_ISSUER } from "./env";

const horizon = new Horizon.Server(HORIZON_URL);

export const tusdcAsset = new Asset(TUSDC_ASSET_CODE, TUSDC_ISSUER);

/** Returns the account's TUSDC balance, or `null` if it has no trustline yet. */
export async function getTusdcStatus(
  address: string,
): Promise<{ hasTrustline: boolean; balance: string }> {
  try {
    const account = await horizon.loadAccount(address);
    const line = account.balances.find(
      (b) =>
        b.asset_type !== "native" &&
        "asset_code" in b &&
        b.asset_code === TUSDC_ASSET_CODE &&
        "asset_issuer" in b &&
        b.asset_issuer === TUSDC_ISSUER,
    );
    return { hasTrustline: !!line, balance: line && "balance" in line ? line.balance : "0" };
  } catch {
    // Account not yet found on the network (never funded with XLM).
    return { hasTrustline: false, balance: "0" };
  }
}

/** Builds an unsigned change_trust transaction so the wallet can sign it. */
export async function buildTrustlineTransaction(address: string) {
  const account = await horizon.loadAccount(address);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset: tusdcAsset }))
    .setTimeout(60)
    .build();
  return tx.toXDR();
}

export async function submitSignedTransaction(signedXdr: string) {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  return horizon.submitTransaction(tx);
}

/** Calls the serverless faucet to grant the caller test TUSDC (requires an existing trustline). */
export async function requestFaucet(address: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch("/api/faucet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, message: data.error ?? "Faucet request failed" };
  }
  return { ok: true, message: data.message ?? "Test funds sent" };
}
