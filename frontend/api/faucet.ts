import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const HORIZON_URL = process.env.HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";
const TUSDC_ASSET_CODE = process.env.TUSDC_ASSET_CODE ?? "TUSDC";
const TUSDC_ISSUER = process.env.TUSDC_ISSUER;
const ISSUER_SECRET = process.env.TUSDC_ISSUER_SECRET;
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT ?? "100";

// Best-effort per-instance rate limit. Serverless instances are ephemeral and
// there can be more than one, so this is a courtesy guard against accidental
// double-clicks during the pilot, not a security boundary.
const lastRequestByAddress = new Map<string, number>();
const COOLDOWN_MS = 60 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!ISSUER_SECRET || !TUSDC_ISSUER) {
    res.status(500).json({ error: "Faucet is not configured on the server" });
    return;
  }

  const address = (req.body?.address ?? "").toString();
  if (!StrKey.isValidEd25519PublicKey(address)) {
    res.status(400).json({ error: "Invalid Stellar address" });
    return;
  }

  const last = lastRequestByAddress.get(address);
  if (last && Date.now() - last < COOLDOWN_MS) {
    res.status(429).json({ error: "Already funded recently, try again later" });
    return;
  }

  const horizon = new Horizon.Server(HORIZON_URL);
  const issuerKeypair = Keypair.fromSecret(ISSUER_SECRET);
  const asset = new Asset(TUSDC_ASSET_CODE, TUSDC_ISSUER);

  try {
    const destinationAccount = await horizon.loadAccount(address);
    const hasTrustline = destinationAccount.balances.some(
      (b) =>
        b.asset_type !== "native" &&
        "asset_code" in b &&
        b.asset_code === TUSDC_ASSET_CODE &&
        "asset_issuer" in b &&
        b.asset_issuer === TUSDC_ISSUER,
    );
    if (!hasTrustline) {
      res.status(400).json({ error: "Add the TUSDC trustline before requesting test funds" });
      return;
    }

    const issuerAccount = await horizon.loadAccount(issuerKeypair.publicKey());
    const tx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({ destination: address, asset, amount: FAUCET_AMOUNT }),
      )
      .setTimeout(60)
      .build();
    tx.sign(issuerKeypair);
    await horizon.submitTransaction(tx);

    lastRequestByAddress.set(address, Date.now());
    res.status(200).json({ message: `Sent ${FAUCET_AMOUNT} TUSDC test funds` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Faucet transaction failed";
    res.status(502).json({ error: message });
  }
}
